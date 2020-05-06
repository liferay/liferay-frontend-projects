/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {parse} from 'acorn';
import {traverse} from 'estraverse';
import estree from 'estree';
import fs from 'fs-extra';
import project from 'liferay-js-toolkit-core/lib/project';

import {buildBundlerDir} from '../../../dirs';
import * as log from '../../../log';
import {render, transformFile} from './util';

/**
 * Wrap generated export bundles inside `Liferay.Loader.define()` calls.
 */
export default async function wrapBundles(): Promise<void> {
	// TODO: update map files

	const {name, version} = project.pkgJson;

	await Promise.all(
		['runtime', 'vendor', ...Object.keys(project.exports)].map(async id => {
			const transform = async (content: string): Promise<string> =>
				await render('bundle-wrapper', {
					content,
					importDependencies: getImportDependencies(id),
					moduleName: `${name}@${version}/${id}.bundle`,
					webpackManifestModuleName: './webpack.manifest',
				});

			const fileName = `${id}.bundle.js`;

			await transformFile(fileName, transform);

			log.debug(`Converted ${fileName} to AMD module`);
		})
	);
}

function getImportDependencies(id: string): string {
	const content = fs
		.readFileSync(buildBundlerDir.join(`${id}.bundle.js`).asNative)
		.toString();

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

	const requiredModules = {};

	traverse(ast as estree.Node, {
		enter(node) {
			if (node.type !== 'CallExpression') {
				return;
			}

			const {callee} = node;

			if (callee.type !== 'Identifier' || callee.name !== '__REQUIRE__') {
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

	return Object.keys(requiredModules)
		.map(module => `,\n\t\t'${module}'`)
		.join('');
}
