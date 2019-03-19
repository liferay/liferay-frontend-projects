/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

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
	const pluginFile = resolveModule.sync(module, {
		basedir: config.pluginsBaseDir,
	});

	return require(pluginFile);
}

/**
 * Get a configuration for a specific package. This method looks in the packages
 * section, then at root in the precedence order: first package id, then package
 * name.
 * @param {PkgDesc} pkg the package descriptor
 * @param  {String} section the section name (like 'plugins', '.babelrc', ...)
 * @param  {Object} defaultValue default value if not configured
 * @return {Object} a configuration object
 */
export function getPackageConfig(pkg, section, defaultValue = undefined) {
	let pkgConfig;

	if (config.packages[pkg.id] && config.packages[pkg.id][section]) {
		pkgConfig = config.packages[pkg.id][section];
	} else if (
		config.packages[pkg.name] &&
		config.packages[pkg.name][section]
	) {
		pkgConfig = config.packages[pkg.name][section];
	} else if (config[pkg.id] && config[pkg.id][section]) {
		pkgConfig = config[pkg.id][section];
	} else if (config[pkg.name] && config[pkg.name][section]) {
		pkgConfig = config[pkg.name][section];
	} else if (config['*'] && config['*'][section]) {
		pkgConfig = config['*'][section];
	} else {
		pkgConfig = defaultValue;
	}

	return pkgConfig;
}
