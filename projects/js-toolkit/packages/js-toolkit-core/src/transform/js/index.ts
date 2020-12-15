/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as escodegen from 'escodegen';
import * as estraverse from 'estraverse';
import estree from 'estree';
import fs from 'fs-extra';
import {RawSourceMap, SourceMapConsumer, SourceMapGenerator} from 'source-map';

import FilePath from '../../file/FilePath';
import {parse} from './parse';

// AST explorer online: https://astexplorer.net/

export interface SourceCode {
	ast?: estree.Node;
	code: string;
	map?: RawSourceMap;
}

export interface SourceTransform {
	(source: SourceCode): Promise<SourceCode>;
}

export async function replace(
	source: SourceCode,
	visitor: estraverse.Visitor
): Promise<SourceCode> {

	// TODO: clone source.ast to avoid modifying source?

	const ast = source.ast || parse(source.code);

	estraverse.replace(ast as estree.Node, visitor);

	const file = source.map ? source.map.file : '<unknown>';

	const transformed = generate(ast, source.code, file);

	return {
		ast,
		code: transformed.code,
		map: await mergeMaps(source.map, transformed.map),
	};
}

export async function transformSource(
	source: SourceCode,
	...transforms: SourceTransform[]
): Promise<SourceCode> {
	source.ast = source.ast || parse(source.code);

	return await transforms.reduce(
		async (sourcePromise, transform) => transform(await sourcePromise),
		Promise.resolve(source)
	);
}

/**
 * Transform a JavaScript file in place
 *
 * @param fromFile the file to transform
 * @param toFile the destination file
 * @param transforms the transform functions to apply
 */
export async function transformSourceFile(
	fromFile: FilePath,
	toFile: FilePath,
	...transforms: SourceTransform[]
): Promise<void> {
	let source = readSource(fromFile);

	source = await transformSource(source, ...transforms);

	writeSource(source, toFile);
}

function generate(
	ast: estree.Node,
	code: string,
	file: string
): {code: string; map: RawSourceMap} {
	if (code === undefined) {
		throw new Error('Code is undefined: sourcemap cannot be generated');
	}
	if (file === undefined) {
		throw new Error('File is undefined: sourcemap cannot be generated');
	}

	const generated = (escodegen.generate(ast, {
		sourceContent: code,
		sourceMap: file,
		sourceMapWithCode: true,
	}) as unknown) as {code: string; map: SourceMapGenerator};

	return {
		code: generated.code,
		map: {
			...JSON.parse(generated.map.toString()),
			file,
		},
	};
}

/**
 * Merge old source map and new source map and return merged.
 *
 * @param old source map object
 * @param newmap new source map object
 * @return merged source map object
 */
async function mergeMaps(
	oldMap: RawSourceMap | undefined,
	newMap: RawSourceMap
): Promise<RawSourceMap> {
	if (oldMap === undefined) {
		return newMap;
	}

	const mergedMapGenerator = new SourceMapGenerator();

	/* eslint-disable @typescript-eslint/await-thenable */
	const oldMapConsumer = await new SourceMapConsumer(oldMap);
	const newMapConsumer = await new SourceMapConsumer(newMap);
	/* eslint-enable @typescript-eslint/await-thenable */

	newMapConsumer.eachMapping((mapping) => {

		// Note that there is no `originalLine` when the node does not come from
		// the original code

		if (!mapping.originalLine) {
			return;
		}

		const origPosInOldMap = oldMapConsumer.originalPositionFor({
			column: mapping.originalColumn,
			line: mapping.originalLine,
		});

		if (origPosInOldMap.source == null) {
			return;
		}

		mergedMapGenerator.addMapping({
			generated: {
				column: mapping.generatedColumn,
				line: mapping.generatedLine,
			},
			name: origPosInOldMap.name,
			original: {
				column: origPosInOldMap.column,
				line: origPosInOldMap.line,
			},
			source: origPosInOldMap.source,
		});
	});

	oldMapConsumer.destroy();
	newMapConsumer.destroy();

	const map = JSON.parse(mergedMapGenerator.toString());

	// Set the destination file of the map

	map.file = newMap.file;

	// Add original source contents

	map.sources = [...oldMap.sources];
	map.sourcesContent = [...oldMap.sourcesContent];

	return map;
}

function readSource(file: FilePath): SourceCode {
	const source: SourceCode = {
		code: fs.readFileSync(file.asNative).toString(),
	};

	// TODO: read source map from file annotation instead of guessing
	// the file name

	try {
		source.map = fs.readJsonSync(`${file.asNative}.map`);
	}
	catch (err) {

		// ignore

	}

	return source;
}

function writeSource(source: SourceCode, file: FilePath): void {
	fs.ensureDirSync(file.dirname().asNative);

	fs.writeFileSync(
		file.asNative,
		source.code + '\n' + `//# sourceMappingURL=${file.basename()}.map`
	);

	fs.writeFileSync(
		`${file.asNative}.map`,
		JSON.stringify({
			...source.map,
			file: file.asPosix,
		})
	);
}
