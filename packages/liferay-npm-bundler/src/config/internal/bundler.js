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
