/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import * as babelUtil from 'liferay-npm-build-tools-common/lib/babel-util';
import * as mod from 'liferay-npm-build-tools-common/lib/modules';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

/**
 * Valid babel plugin options are:
 *	  packageName: '<package.json>'
 *    srcPrefixes: ['src']
 * @return {object} a babel visitor
 */
export default function({types: t}) {
	const nameVisitor = {
		ExpressionStatement(path, state) {
			const {
				node: {expression},
			} = path;
			const {
				file: {
					opts: {filename},
				},
			} = state;
			const {opts} = state;
			const {log} = state;

			if (t.isCallExpression(expression)) {
				const {callee} = expression;

				if (t.isIdentifier(callee, {name: 'define'})) {
					const {arguments: args} = expression;

					let insertName = false;
					let unshiftName = true;

					switch (args.length) {
						case 1:
							insertName = t.isFunctionExpression(args[0]);
							break;

						case 2:
							insertName =
								t.isArrayExpression(args[0]) &&
								t.isFunctionExpression(args[1]);
							break;

						case 3:
							unshiftName = false;
							insertName =
								t.isStringLiteral(args[0]) &&
								t.isArrayExpression(args[1]) &&
								t.isFunctionExpression(args[2]);
							break;

						default:
							throw new Error(
								`Unexpected argument count of ${args.length}`
							);
					}

					if (insertName) {
						const moduleName = getModuleName(filename, opts);

						if (unshiftName) {
							args.unshift(t.stringLiteral(moduleName));
						} else {
							args[0].value = moduleName;
						}

						log.info(
							'name-amd-modules',
							`Set module name to '${moduleName}'`
						);

						path.stop();
					}
				}
			}
		},
	};

	return {
		visitor: {
			Program: {
				enter(path, state) {
					const {log} = babelIpc.get(state, () => ({
						log: new PluginLogger(),
					}));

					state.log = log;
				},
				exit(path, state) {
					// We must traverse the AST again because the
					// transform-es2015-modules-amd plugin emits its define()
					// call after exiting Program node :-(
					path.traverse(nameVisitor, state);
				},
			},
		},
	};
}

function getModuleName(absFilePath, {packageName, srcPrefixes}) {
	const moduleName = babelUtil.getModuleName(absFilePath);

	// Decompose module name
	const moduleNameParts = mod.splitModuleName(moduleName);

	const result = {
		packageName: moduleNameParts.scope
			? `${moduleNameParts.scope}/${moduleNameParts.pkgName}`
			: moduleNameParts.pkgName,
		name: moduleNameParts.modulePath.substr(1),
	};

	// Override package name if needed
	if (packageName !== undefined && packageName !== '<package.json>') {
		result.packageName = packageName;
	}

	// Remove prefixes if needed
	if (srcPrefixes) {
		for (const srcPrefix of srcPrefixes) {
			if (result.name.startsWith(srcPrefix)) {
				result.name = result.name.substr(srcPrefix.length + 1);
				break;
			}
		}
	}

	// Recompose module name
	return `${result.packageName}/${result.name}`;
}
