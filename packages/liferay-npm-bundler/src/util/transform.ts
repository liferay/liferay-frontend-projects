/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {parse} from 'acorn';
import {traverse} from 'estraverse';
import ESTree from 'estree';
import path from 'path';

import Renderer from './renderer';

const renderer = new Renderer(path.join(__dirname, 'templates'));

export async function wrapModule(
	moduleName: string,
	sourceCode: string
): Promise<string> {
	return await renderer.render('wrap-module', {
		importDependencies: getImportedModules(sourceCode)
			.map(module => `,\n\t\t'${module}'`)
			.join(''),
		moduleName,
		sourceCode,
	});
}

function getImportedModules(sourceCode: string): string[] {
	const ast = parse(sourceCode, {
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

			if (params[0].type !== 'Literal') {
				return;
			}

			// Due to a misdeclaration of Literal in ESTree we must cast params[0]
			const {value: moduleName} = params[0] as {value};

			if (typeof moduleName !== 'string') {
				return;
			}

			requiredModules[moduleName] = true;
		},
	});

	return Object.keys(requiredModules);
}
