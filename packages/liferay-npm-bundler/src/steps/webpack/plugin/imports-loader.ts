/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {parse} from 'acorn';
import {generate} from 'escodegen';
import {traverse} from 'estraverse';
import ESTree from 'estree';
import {addNamespace} from 'liferay-npm-build-tools-common/lib/namespace';
import project from 'liferay-npm-build-tools-common/lib/project';

export default function(content: string): string {
	if (content.indexOf('require') == -1) {
		return content;
	}

	let importsFound = false;

	for (const pkgName of Object.keys(project.imports)) {
		if (content.indexOf(pkgName) != -1) {
			importsFound = true;

			break;
		}
	}

	if (!importsFound) {
		return content;
	}

	const ast = parse(content, {
		allowAwaitOutsideFunction: true,
		allowHashBang: true,
		allowImportExportEverywhere: true,
		allowReserved: true,
		allowReturnOutsideFunction: true,
		ecmaVersion: 10,
		locations: true,
		sourceType: 'module',
	});

	let modified = false;

	const {imports} = project;

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

			const config = imports[moduleName];

			if (!config) {
				return;
			}

			callee.name = '__REQUIRE__';
			params[0]['value'] = addNamespace(moduleName, {
				name: config.provider,
			});

			modified = true;
		},
	});

	if (modified) {
		content = generate(ast, {});
	}

	return content;
}
