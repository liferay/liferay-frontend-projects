/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

// TODO: Move this whole file to liferay-npm-build-tools-common (see #328)

import prop from 'dot-prop';

import {configRequire, getPackageConfig} from './util';

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
 * Extra dependencies to add to the final bundle (in addition to those listed
 * under the dependencies section of package.json).
 * @return {Array} an array of package names
 */
export function getIncludeDependencies() {
	return prop.get(config, 'include-dependencies', []);
}

/**
 * Get the liferay-nmp-bundler plugins for a given package.
 * @param {String} phase 'pre', 'post' or 'copy'
 * @param {PkgDesc} pkg the package descriptor
 * @return {Array} the instantiated Babel plugins
 */
export function getPlugins(phase, pkg) {
	const pluginsKey = {
		copy: 'copy-plugins',
		pre: 'plugins',
		post: 'post-plugins',
	}[phase];

	const pluginNames = getPackageConfig(pkg, pluginsKey, []);

	return instantiatePlugins(pluginNames);
}

/**
 * Get maximum number of files to process in parallel.
 * @return {number}
 */
export function getMaxParallelFiles() {
	// Default values for "ulimit -n" vary across different OSes. Some values
	// I have found are:
	//   - Apparently Mac OS X limit is 256 but usually people increase it
	//   - Fedora: 1024
	//   - Windows: there's no ulimit, but MSVCRT.DLL has a 2048 limit
	// Given this mess and the impossibility of retrieving the limit from Node,
	// I'm giving this a default value of 128 because it looks like it doesn't
	// impact performance and should be low enough to make it work in all OSes.
	return prop.get(config, 'max-parallel-files', 128);
}

/**
 * Instantiate bundler plugins described by their names.
 * @param  {Array} pluginNames list of plugin names to instantiate
 * @return {Array} list of plugin descriptors with name, config and run fields
 */
function instantiatePlugins(pluginNames) {
	return pluginNames.map(pluginName => {
		let pluginConfig = {};

		if (Array.isArray(pluginName)) {
			pluginConfig = pluginName[1];
			pluginName = pluginName[0];
		}

		const pluginModule = configRequire(
			`liferay-npm-bundler-plugin-${pluginName}`
		);

		return {
			name: pluginName,
			config: pluginConfig,
			run: pluginModule.default,
		};
	});
}
