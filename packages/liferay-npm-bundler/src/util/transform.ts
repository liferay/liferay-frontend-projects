/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {parse} from 'acorn';
import {generate} from 'escodegen';
import {Visitor, replace, traverse} from 'estraverse';
import ESTree, {Statement} from 'estree';
import {RawSourceMap, SourceMapConsumer, SourceMapGenerator} from 'source-map';

export interface SourceWithMap {
	code: string;
	fileName: string;
	map?: RawSourceMap;
}

export async function transform(
	source: SourceWithMap,
	destFileName: string,
	visitor: Visitor
): Promise<SourceWithMap> {
	const ast = parse(source.code, {
		allowAwaitOutsideFunction: true,
		allowHashBang: true,
		allowImportExportEverywhere: true,
		allowReserved: true,
		allowReturnOutsideFunction: true,
		ecmaVersion: 10,
		locations: true,
		sourceType: 'module',
	});

	replace(ast as ESTree.Node, visitor);

	const transformed = (generate(ast, {
		sourceMap: source.fileName,
		sourceMapWithCode: true,
		sourceContent: source.code,
	}) as unknown) as {code: string; map: SourceMapGenerator};

	const transformedMap = JSON.parse(transformed.map.toString());

	transformedMap.file = destFileName;

	const map = source.map
		? await mergeMaps(source.map, transformedMap)
		: transformedMap;

	return {
		fileName: destFileName,
		code: transformed.code,
		map,
	};
}

export async function wrapModule(
	source: SourceWithMap
): Promise<SourceWithMap> {
	const moduleName = source.fileName.replace(/\.js$/i, '');

	const wrapAst = (parse(`
	Liferay.Loader.define(
		'${moduleName}',
		[
			'module',
			'require'
			${getDefineDependencies(source.code)}
		],
		function(module, require) {
		}
	);
	`) as unknown) as ESTree.Program;

	const destFileName = source.fileName.replace(/\.js$/i, '.amd.js');

	return transform(source, destFileName, {
		enter(node) {
			if (node.type !== 'Program') {
				return;
			}

			const program = node;

			const {body: wrapBody} = wrapAst;

			const moduleBody = getBlockStatement(wrapAst);

			moduleBody.body = getProgramStatements(program);

			program.body = wrapBody;
		},
	});
}

function getBlockStatement(wrapAst: ESTree.Program): ESTree.BlockStatement {
	const {body: wrapBody} = wrapAst;

	if (wrapBody.length !== 1) {
		throw new Error('Program body has more than one node');
	}

	if (wrapBody[0].type !== 'ExpressionStatement') {
		throw new Error('Program is not an expression statement');
	}

	const {expression} = wrapBody[0];

	if (expression.type !== 'CallExpression') {
		throw new Error('Program is not a call expression');
	}

	const {arguments: args} = expression;

	if (args.length !== 3) {
		throw new Error(
			'Program call expression must have exactly three arguments'
		);
	}

	const arg2 = args[2];

	if (arg2.type !== 'FunctionExpression') {
		throw new Error(
			'Second argument of program call expression is not a function'
		);
	}

	const {body: moduleBody} = arg2;

	if (moduleBody.type !== 'BlockStatement') {
		throw new Error('Argument function body is not a block statement');
	}

	return moduleBody;
}

function getDefineDependencies(source: string): string {
	const ast = parse(source, {
		allowAwaitOutsideFunction: true,
		allowHashBang: true,
		allowImportExportEverywhere: true,
		allowReserved: true,
		allowReturnOutsideFunction: true,
		ecmaVersion: 10,
		locations: true,
		sourceType: 'module',
	});

	const requiredModules = {};

	traverse(ast as ESTree.Node, {
		enter(node) {
			if (node.type !== 'CallExpression') {
				return;
			}

			const {callee} = node;

			if (callee.type !== 'Identifier' || callee.name !== 'require') {
				return;
			}

			const {arguments: params} = node;

			if (params.length != 1) {
				return;
			}

			const param0 = params[0];

			if (param0.type !== 'Literal') {
				return;
			}

			const {value: moduleName} = param0;

			if (typeof moduleName !== 'string') {
				return;
			}

			requiredModules[moduleName] = true;
		},
	});

	return Object.keys(requiredModules)
		.map(module => `,\n\t\t'${module}'`)
		.join('');
}

/**
 * Programs may have Directives, Statements, and ModuleDeclarations as children,
 * but if we are wrapping them info an AMD function, we cannot insert other than
 * Statements inside it, so we must filter out ModuleDeclarations (Directives
 * are an specialized type of ExpressionStatements).
 *
 * In case we find any ModuleDeclaration, we throw an error because the build
 * won't be functional anyway so better failing fast than waiting for a runtime
 * error.
 *
 * @param program
 */
function getProgramStatements(program: ESTree.Program): Statement[] {
	const statementNodes = {
		ExpressionStatement: true,
		BlockStatement: true,
		EmptyStatement: true,
		DebuggerStatement: true,
		WithStatement: true,
		ReturnStatement: true,
		LabeledStatement: true,
		BreakStatement: true,
		ContinueStatement: true,
		IfStatement: true,
		SwitchStatement: true,
		ThrowStatement: true,
		TryStatement: true,
		WhileStatement: true,
		DoWhileStatement: true,
		ForStatement: true,
		ForInStatement: true,
		ForOfStatement: true,
		FunctionDeclaration: true,
		VariableDeclaration: true,
		ClassDeclaration: true,
	};

	const nonStatementNode = program.body.find(
		node => statementNodes[node.type] !== true
	);

	if (nonStatementNode) {
		throw new Error(
			`Found a ${nonStatementNode.type} node in Program but only` +
				`Statements are allowed`
		);
	}

	return (program.body as unknown[]) as Statement[];
}

/**
 * Merge old source map and new source map and return merged.
 *
 * @param old source map object
 * @param newmap new source map object
 * @return merged source map object
 */
async function mergeMaps(
	oldMap: RawSourceMap,
	newMap: RawSourceMap
): Promise<RawSourceMap> {
	const mergedMapGenerator = new SourceMapGenerator();

	const oldMapConsumer = await new SourceMapConsumer(oldMap);
	const newMapConsumer = await new SourceMapConsumer(newMap);

	newMapConsumer.eachMapping(mapping => {
		// Note that `originalLine` is null when the node does not come from the
		// original code
		if (mapping.originalLine == null) {
			return;
		}

		const origPosInOldMap = oldMapConsumer.originalPositionFor({
			line: mapping.originalLine,
			column: mapping.originalColumn,
		});

		if (origPosInOldMap.source == null) {
			return;
		}

		mergedMapGenerator.addMapping({
			original: {
				line: origPosInOldMap.line,
				column: origPosInOldMap.column,
			},
			generated: {
				line: mapping.generatedLine,
				column: mapping.generatedColumn,
			},
			source: origPosInOldMap.source,
			name: origPosInOldMap.name,
		});
	});

	const map = JSON.parse(mergedMapGenerator.toString());

	// Set the destination file of the map
	map.file = newMap.file;

	// Add intermediate source content (the final state of oldMap) for
	// reference. Note that it is not strictly needed as the map we will return
	// goes from the very original source code to the latest transformation
	// defined by newMap, thus all intermediate transformations are only needed
	// as a historical record of what happened, but are not read by the source
	// map consumer when applying the mappings.
	map.sources = [...oldMap.sources, ...newMap.sources];
	map.sourcesContent = [...oldMap.sourcesContent, ...newMap.sourcesContent];

	return map;
}
