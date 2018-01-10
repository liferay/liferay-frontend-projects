import {getPackageDir} from 'liferay-npm-build-tools-common/lib/packages';
import path from 'path';
import readJsonSync from 'read-json-sync';
import resolveModule from 'resolve';

let pluginsBaseDir = '.';
let config = loadConfig();

/**
 * Load configuration.
 * @return {Object} the configuration object
 */
function loadConfig() {
	// Load base configuration
	let config = {};

	try {
		config = readJsonSync('.npmbundlerrc');
	} catch (err) {
		if (err.code !== 'ENOENT') {
			throw err;
		}
	}

	// Apply preset if necessary
	if (config.preset) {
		const presetFile = resolveModule.sync(config.preset, {
			basedir: '.',
		});

		// Merge preset with base configuration
		config = Object.assign(readJsonSync(presetFile), config);
		pluginsBaseDir = getPackageDir(presetFile);
	}

	// Normalize
	config.packages = config.packages || {};

	return config;
}

/**
 * Require a module using the configured plugins directory.
 * @param {String} module a module name
 * @return {Object} the required module object
 */
function configRequire(module) {
	const pluginFile = resolveModule.sync(module, {
		basedir: pluginsBaseDir,
	});

	return require(pluginFile);
}

/**
 * Force a config reload
 * @return {void}
 */
export function reloadConfig() {
	config = loadConfig();
}

/**
 * Get the configured output directory
 * @return {String} the directory path (with native separators)
 */
export function getOutputDir() {
	const dir = config['output'] || 'build/resources/main/META-INF/resources';
	return path.normalize(dir);
}

/**
 * Get the configured file exclusions for a given package.
 * @param {Object} pkg the package descriptor hash containing id, name, version
 *        and dir fields
 * @return {Array} an array of glob expressions
 */
export function getExclusions(pkg) {
	let exclusions = config.exclude || {};

	exclusions =
		exclusions[pkg.id] || exclusions[pkg.name] || exclusions['*'] || [];

	return exclusions;
}

/**
 * Load Babel plugins from a given array of presets and plugins.
 * @param {Array} presets an array of Babel preset names as defined by .babelrc
 * @param {Array} plugins an array of Babel plugins names as defined by .babelrc
 * @return {Array} the instantiated Babel plugins
 */
export function loadBabelPlugins(presets, plugins) {
	return []
		.concat(
			...presets.map(preset => {
				let presetModule;

				try {
					presetModule = configRequire(preset);
				} catch (err) {
					presetModule = configRequire(`babel-preset-${preset}`);
				}

				return presetModule.plugins || presetModule.default().plugins;
			})
		)
		.concat(plugins);
}

/**
 * Get the liferay-nmp-bundler plugins for a given package.
 * @param {String} phase 'pre' or 'post'
 * @param {Object} pkg the package descriptor hash containing id, name, version
 *        and dir fields
 * @return {Array} the instantiated Babel plugins
 */
export function getPlugins(phase, pkg) {
	const pluginsKey = phase === 'pre' ? 'plugins' : 'post-plugins';
	const plugins = getPackageConfig(pkg, pluginsKey) || [];

	return plugins.map(pluginName => {
		let pluginConfig = {};

		if (Array.isArray(pluginName)) {
			pluginConfig = pluginName[1];
			pluginName = pluginName[0];
		}

		const pluginModule = configRequire(
			`liferay-npm-bundler-plugin-${pluginName}`
		);

		return {
			run: pluginModule.default,
			config: pluginConfig,
		};
	});
}

/**
 * Get Babel config for a given package
 * @param {Object} pkg the package descriptor hash containing id, name, version
 *        and dir fields
 * @return {Object} a Babel configuration object as defined by its API
 */
export function getBabelConfig(pkg) {
	return getPackageConfig(pkg, '.babelrc') || {};
}

/**
 * Whether or not to process npm packages serially
 * @return {boolean}
 */
export function isProcessSerially() {
	return config['process-serially'] || false;
}

/**
 * Whether or not to dump detailed information about what the tool is doing
 * @return {boolean}
 */
export function isVerbose() {
	return config['verbose'] || false;
}

/**
 * Get version numbers of all plugins used in the build.
 * @return {Object} a map of {plugin-name: version} values
 */
export function getPluginVersions() {
	let pluginVersions = {};

	// Get preset plugin version
	if (config.preset) {
		pluginVersions[config.preset] = configRequire(
			`${config.preset}/package.json`
		).version;
	}

	// Get legacy package and package plugins versions
	let plugins = [];

	for (let key in config) {
		if (config.hasOwnProperty(key)) {
			plugins = concatAllPlugins(plugins, config[key]);
		}
	}

	for (let key in config.packages) {
		if (config.packages.hasOwnProperty(key)) {
			plugins = concatAllPlugins(plugins, config.packages[key]);
		}
	}

	for (let plugin of plugins) {
		if (!pluginVersions[plugin]) {
			pluginVersions[plugin] = configRequire(
				`${plugin}/package.json`
			).version;
		}
	}

	return pluginVersions;
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
 * Get a configuration for a specific package. This method looks in the packages
 * section, then at root in the precedence order: first package id, then package
 * name.
 * @param {Object} pkg the package descriptor hash containing id, name, version
 *        and dir fields
 * @param  {String} key the key name
 * @return {Object} a configuration object
 */
function getPackageConfig(pkg, key) {
	let pkgConfig;

	if (config.packages[pkg.id] && config.packages[pkg.id][key]) {
		pkgConfig = config.packages[pkg.id][key];
	} else if (config.packages[pkg.name] && config.packages[pkg.name][key]) {
		pkgConfig = config.packages[pkg.name][key];
	} else if (config[pkg.id] && config[pkg.id][key]) {
		pkgConfig = config[pkg.id][key];
	} else if (config[pkg.name] && config[pkg.name][key]) {
		pkgConfig = config[pkg.name][key];
	} else if (config['*'] && config['*'][key]) {
		pkgConfig = config['*'][key];
	}

	return pkgConfig;
}
