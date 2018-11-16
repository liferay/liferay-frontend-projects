import {configRequire, getPackageConfig} from './_util';

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
	return config['include-dependencies'] || [];
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
 * Whether or not to process npm packages serially
 * @return {boolean}
 */
export function isProcessSerially() {
	return config['process-serially'] || false;
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
