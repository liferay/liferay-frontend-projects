/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

// TODO: Move this whole file to liferay-npm-build-tools-common (see #328)

import resolveModule from 'resolve';

let config;

/**
 * Initialize submodule
 * @param {object} state
 * @return {void}
 */
export function init(state) {
	config = state.config;
}

/**
 * Require a module using the configured plugins directory.
 * @param {String} module a module name
 * @return {Object} the required module object
 */
export function configRequire(module) {
	return require(configResolve(module));
}

/**
 * Resolve a module using the configured plugins directory.
 * @param {String} module a module name
 * @return {Object} the required module object
 */
function configResolve(module) {
	let pluginFile;

	try {
		pluginFile = resolveModule.sync(module, {
			basedir: config.pluginsBaseDir,
		});
	} catch (err) {
		pluginFile = resolveModule.sync(module, {
			basedir: '.',
		});
	}

	return pluginFile;
}
