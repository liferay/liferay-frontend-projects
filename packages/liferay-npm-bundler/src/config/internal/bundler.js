/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

// TODO: Move this whole file to liferay-npm-build-tools-common (see #328)

import prop from 'dot-prop';

import {configRequire, configResolve, getPackageConfig} from './util';

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
 * Get the configured file exclusions for a given package.
 * @param {PkgDesc} pkg the package descriptor
 * @return {Array} an array of glob expressions
 */
export function getExclusions(pkg) {
	let exclusions = config.exclude || {};

	// If it is explicitly false, return an empty exclusions array
	if (
		exclusions[pkg.id] === false ||
		exclusions[pkg.name] === false ||
		exclusions['*'] === false
	) {
		return [];
	}

	// If it is explicitly true, return an array with '**/*'
	if (
		exclusions[pkg.id] === true ||
		exclusions[pkg.name] === true ||
		exclusions['*'] === true
	) {
		return ['**/*'];
	}

	// In any other case, return what's in the config
	exclusions =
		exclusions[pkg.id] || exclusions[pkg.name] || exclusions['*'] || [];

	return exclusions;
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
 * Get configured rules for a certain package.
 * @param {PkgDesc} pkg
 */
export function getRules(pkg) {
	const rules = getPackageConfig(pkg, 'rules', []);

	// Normalize rules
	rules.forEach(rule => {
		// `rule.files` must be array
		if (typeof rule.files === 'string') {
			rule.files = [rule.files];
		}

		// `rule.use` must be an array
		if (!Array.isArray(rule.use)) {
			rule.use = [rule.use];
		}

		// Normalize each `rule.use` instance
		rule.use = rule.use.map(use => {
			// Each `rule.use` instance must be an object
			if (typeof use === 'string') {
				use = {
					loader: use,
					options: {},
				};
			}

			// Each `rule.use` instance must have `options`
			if (use.options === undefined) {
				use.options = {};
			}

			return use;
		});
	});

	return instantiateLoaders(rules);
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

function instantiateLoaders(rules) {
	return rules.map(rule => {
		rule.use = rule.use.map(({loader, options}) => {
			let exec, resolvedLoader;

			try {
				resolvedLoader = `liferay-npm-bundler-loader-${loader}`;
				exec = configRequire(resolvedLoader);
			} catch (err) {
				resolvedLoader = loader;
				exec = configResolve(resolvedLoader);
			}

			exec = exec.default || exec;

			if (typeof exec !== 'function') {
				throw new Error(
					`Loader '${resolvedLoader}' is incorrect: ` +
						`it does not export a function`
				);
			}

			return {
				loader,
				options,
				resolvedLoader,
				exec,
			};
		});

		return rule;
	});
}
