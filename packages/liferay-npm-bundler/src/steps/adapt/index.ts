/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import crypto from 'crypto';
import fs from 'fs-extra';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import {buildBundlerDir, buildGeneratedDir} from '../../dirs';
import * as log from '../../log';
import {findFiles} from '../../util/files';
import Renderer from '../../util/renderer';
import {
	SourceCode,
	replaceInStringLiterals,
	wrapModule,
} from '../../util/transform';
import {removeWebpackHash} from '../../util/webpack';

export async function renderTemplates(): Promise<void> {
	const renderer = new Renderer(
		path.join(__dirname, project.probe.type, 'templates')
	);

	const {pkgJson} = project;

	await renderAndWrapTemplate(renderer, 'adapt-rt.js', {
		project,
	});
	await renderAndWrapTemplate(renderer, 'index.js', {
		pkgJson,
	});
}

export async function wrapWebpackBundles(): Promise<void> {
	const adaptBuildDir = project.dir.join(project.adapt.buildDir);

	const copiedBundles = findFiles(adaptBuildDir, ['static/js/*.js']);

	const {name, version} = project.pkgJson;

	return Promise.all(
		copiedBundles.map(async file => {
			const unhashedFile = removeWebpackHash(file);

			let source: SourceCode = readSourceWithMap(
				adaptBuildDir.join(file),
				`${name}@${version}/${unhashedFile.asPosix}`
			);

			source = await wrapModule(source);

			source = await namespaceWepbackJsonp(source);

			writeSourceWithMap(source, buildBundlerDir.join(unhashedFile));
		})
	).then(() => {
		log.debug(`Wrapped ${copiedBundles.length} webpack bundles`);
	});
}

async function namespaceWepbackJsonp(source: SourceCode): Promise<SourceCode> {
	const hash = crypto.createHash('MD5');

	const {name, version} = project.pkgJson;

	hash.update(name);
	hash.update(version);

	const uuid = hash
		.digest('base64')
		.replace(/\+/g, '_')
		.replace(/\//g, '_')
		.replace(/=/g, '');

	return await replaceInStringLiterals(
		source,
		'webpackJsonp',
		`webpackJsonp_${uuid}_`
	);
}

function readSourceWithMap(file: FilePath, fileName?: string): SourceCode {
	// TODO: read source map from file annotation instead of guessing
	// the file name

	return {
		fileName: fileName ? fileName : file.asNative,
		code: fs.readFileSync(file.asNative).toString(),
		map: fs.readJsonSync(`${file.asNative}.map`),
	};
}

function writeSourceWithMap(source: SourceCode, file: FilePath): void {
	fs.ensureDirSync(file.dirname().asNative);

	const filePath = file.asNative;

	fs.writeFileSync(
		filePath,
		source.code + '\n' + `//# sourceMappingURL=${file.basename()}.map`
	);

	fs.writeFileSync(`${filePath}.map`, JSON.stringify(source.map));
}

async function renderAndWrapTemplate(
	renderer: Renderer,
	templatePath: string,
	data: object
): Promise<void> {
	const renderedCode = await renderer.render(templatePath, data);

	fs.writeFileSync(
		buildGeneratedDir.join(templatePath).asNative,
		renderedCode
	);

	const {name, version} = project.pkgJson;

	const wrapped = await wrapModule({
		fileName: `${name}@${version}/${templatePath}`,
		code: renderedCode,
	});

	writeSourceWithMap(wrapped, buildBundlerDir.join(templatePath));

	log.debug(`Rendered ${templatePath} adapter module`);
}
