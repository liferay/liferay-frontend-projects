/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

// TODO: Move this to whole file to liferay-npm-build-tools-common (see #328)

import {getPackageDir} from 'liferay-npm-build-tools-common/lib/packages';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';
import readJsonSync from 'read-json-sync';
import resolveModule from 'resolve';
import merge from 'merge';

// These state objects are consts so that they can be injected into private
// submodules just once.
const config = {};
const pkgJson = {};
const savedProgramArgs = [];

// Load things for the first time
loadConfig();
loadPkgJson();

/**
 * Get versions information
 * @return {void}
 */
export function getVersionsInfo() {
	const pkgJson = require('../../package.json');

	let info = {
		'liferay-npm-bundler': pkgJson.version,
	};

	info = Object.assign(
		info,
		getPluginVersions(),
		project.rules.loaderVersionsInfo
	);

	return info;
}

/**
 * Force a config reload
 * @return {void}
 */
export function reloadConfig() {
	loadConfig();
	loadPkgJson();
	setProgramArgs(savedProgramArgs);
}

/**
 * Set CLI arguments to be able to override some .npmbundlerrc options.
 * @param {Array} args passed in CLI arguments
 */
export function setProgramArgs(args) {
	savedProgramArgs.length = 0;
	savedProgramArgs.push(args);

	if (args.includes('-j') || args.includes('--create-jar')) {
		config['create-jar'] = true;
	}

	if (args.includes('-r') || args.includes('--dump-report')) {
		config['dump-report'] = true;
	}

	if (args.includes('--no-tracking')) {
		config['no-tracking'] = true;
	}
}

/**
 * Add version numbers for all bundler and Babel plugins listed in `cfg`.
 * @param {Array} plugins the array of currently collected plugins
 * @param {Array} cfg a configuration subsection
 * @return {Array} the concatenated array of collected plugins
 */
function concatAllPlugins(plugins, cfg) {
	if (cfg) {
		plugins = concatBundlerPlugins(plugins, cfg['plugins']);
		plugins = concatBundlerPlugins(plugins, cfg['post-plugins']);
		plugins = concatBabelPlugins(plugins, cfg['.babelrc']);
	}

	return plugins;
}

/**
 * Add version numbers for all Babel plugins listed in `cfg`.
 * @param {Array} plugins the array of currently collected plugins
 * @param {Array} cfg a configuration subsection
 * @return {Array} the concatenated array of collected plugins
 */
function concatBabelPlugins(plugins, cfg) {
	if (!cfg) {
		return plugins;
	}

	const babelPresets = cfg['presets'];
	const babelPlugins = cfg['plugins'];

	if (babelPresets) {
		plugins = plugins.concat(
			babelPresets.map(name => {
				try {
					configRequire(name);
					return name;
				} catch (err) {
					return `babel-preset-${name}`;
				}
			})
		);
	}

	if (babelPlugins) {
		plugins = plugins.concat(
			babelPlugins.map(name => {
				if (Array.isArray(name)) {
					name = name[0];
				}

				try {
					configRequire(name);
					return name;
				} catch (err) {
					return `babel-plugin-${name}`;
				}
			})
		);
	}

	return plugins;
}

/**
 * Add version numbers for all bundler plugins listed in `cfg`.
 * @param {Array} plugins the array of currently collected plugins
 * @param {Array} cfg a configuration subsection
 * @return {Array} the concatenated array of collected plugins
 */
function concatBundlerPlugins(plugins, cfg) {
	if (!cfg) {
		return plugins;
	}

	return plugins.concat(
		cfg.map(name => {
			if (Array.isArray(name)) {
				name = name[0];
			}

			return `liferay-npm-bundler-plugin-${name}`;
		})
	);
}

/**
 * Require a module using the configured plugins directory.
 * @param {String} module a module name
 * @return {Object} the required module object
 */
function configRequire(module) {
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

/**
 * Get version numbers of all plugins used in the build.
 * @return {Object} a map of {plugin-name: version} values
 */
function getPluginVersions() {
	const pluginVersions = {};

	// Get preset plugin version
	if (config.preset) {
		const pkgJson = configRequire(`${config.preset}/package.json`);

		pluginVersions[config.preset] = pkgJson.version;
	}

	// Get legacy package and package plugins versions
	let plugins = [];

	for (const key in config) {
		if (Object.prototype.hasOwnProperty.call(config, key)) {
			plugins = concatAllPlugins(plugins, config[key]);
		}
	}

	for (const key in config.packages) {
		if (Object.prototype.hasOwnProperty.call(config.packages, key)) {
			plugins = concatAllPlugins(plugins, config.packages[key]);
		}
	}

	for (const plugin of plugins) {
		if (!pluginVersions[plugin]) {
			const pkgJson = configRequire(`${plugin}/package.json`);

			pluginVersions[plugin] = pkgJson.version;
		}
	}

	return pluginVersions;
}

/**
 * Load configuration from current work dir into config object.
 * @return {void}
 */
function loadConfig() {
	// Clean configuration
	for (const key in config) {
		if (Object.prototype.hasOwnProperty.call(config, key)) {
			delete config[key];
		}
	}

	// Load base configuration
	try {
		Object.assign(config, readJsonSync('.npmbundlerrc'));
	} catch (err) {
		if (err.code !== 'ENOENT') {
			throw err;
		}
	}

	// Store plugins base dir
	config.pluginsBaseDir = path.resolve('.');

	// Apply preset if necessary
	let presetFile;

	if (config.preset === undefined) {
		presetFile = require.resolve('liferay-npm-bundler-preset-standard');
	} else if (config.preset === '' || config.preset === false) {
		// don't load preset
	} else {
		presetFile = resolveModule.sync(config.preset, {
			basedir: '.',
		});
	}

	if (presetFile) {
		const originalConfig = Object.assign({}, config);
		Object.assign(
			config,
			merge.recursive(readJsonSync(presetFile), originalConfig)
		);
		config.pluginsBaseDir = getPackageDir(presetFile);
	}

	// Normalize
	config['/'] = config['/'] || {};
	config['config'] = config['config'] || {};
	config.packages = config.packages || {};
}

/**
 * Load package.json from current work dir into config object.
 * @return {void}
 */
function loadPkgJson() {
	// Clean pkgJson
	for (const key in pkgJson) {
		if (Object.prototype.hasOwnProperty.call(pkgJson, key)) {
			delete pkgJson[key];
		}
	}

	Object.assign(pkgJson, readJsonSync('package.json'));
}
