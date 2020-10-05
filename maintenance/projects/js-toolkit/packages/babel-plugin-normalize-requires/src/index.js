/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';

/**
 * @return {object} a babel visitor
 */
export default function({types: t}) {
	return {
		visitor: {
			Identifier: {
				exit(path, state) {
					const {node} = path;

					if (node.name == 'require') {
						const parent = path.parent;

						if (t.isCallExpression(parent)) {
							const argument = parent.arguments[0];

							if (t.isLiteral(argument) && argument.value) {
								let moduleName = argument.value;

								if (
									typeof moduleName === 'string' &&
									!isPackageName(moduleName)
								) {
									if (moduleName.endsWith('.js')) {
										moduleName = moduleName.substring(
											0,
											moduleName.length - 3
										);
									}

									if (moduleName.endsWith('/')) {
										moduleName = moduleName.substring(
											0,
											moduleName.length - 1
										);
									}
								}

								if (!state.normalizeCount) {
									state.normalizeCount = 1;
								} else {
									state.normalizeCount++;
								}

								argument.value = moduleName;
							}
						}
					}
				},
			},
			Program: {
				exit(path, state) {
					if (state.normalizeCount) {
						const {log} = babelIpc.get(state, () => ({
							log: new PluginLogger(),
						}));

						log.info(
							'normalize-requires',
							'Normalized',
							state.normalizeCount,
							'requires'
						);
					}
				},
			},
		},
	};
}

/**
 * Check whether a module name refers to a package entry point.
 * @param {String} moduleName the name of a JS module
 * @return {boolean} true if moduleName is a package name
 */
function isPackageName(moduleName) {
	const firstSlashIndex = moduleName.indexOf('/');

	if (firstSlashIndex == -1) {
		return true;
	}

	const restOfModuleName = moduleName.substring(firstSlashIndex + 1);

	if (moduleName.startsWith('@') && restOfModuleName.indexOf('/') == -1) {
		return true;
	}

	return false;
}
