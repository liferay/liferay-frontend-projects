import {getPackageDir} from 'liferay-npm-build-tools-common/lib/packages';
import path from 'path';
import readJsonSync from 'read-json-sync';
import resolveModule from 'resolve';

let pluginsBaseDir = '.';
let config = loadConfig();
let programArgs = [];

/**
 * Load configuration.
 * @return {Object} the configuration object
 */
function loadConfig() {
	let config = {};

	// Load base configuration
	try {
		config = readJsonSync('.npmbundlerrc');
	} catch (err) {
		if (err.code !== 'ENOENT') {
			throw err;
		}
	}

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
		config = Object.assign(readJsonSync(presetFile), config);
		pluginsBaseDir = getPackageDir(presetFile);
	}

	// Normalize
	config['/'] = config['/'] || {};
	config['config'] = config['config'] || {};
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
	pluginsBaseDir = '.';
	config = loadConfig();
	setProgramArgs(programArgs);
}

/**
 * Set CLI arguments to be able to override some .npmbundlerrc options.
 * @param {Array} args passed in CLI arguments
 */
export function setProgramArgs(args) {
	programArgs = args;

	if (args.includes('-r') || args.includes('--dump-report')) {
		config['dump-report'] = true;
	}
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
 * Get the path to the report file or null if no report is configured.
 * @return {String} a normalized path or null
 */
export function getReportFilePath() {
	return path.join('.', 'liferay-npm-bundler-report.html');
}

/**
 * Get the configured file exclusions for a given package.
 * @param {PkgDesc} pkg the package descriptor
 * @return {Array} an array of glob expressions
 */
export function getExclusions(pkg) {
	let exclusions = config.exclude || {};

	exclusions =
		exclusions[pkg.id] || exclusions[pkg.name] || exclusions['*'] || [];

	return exclusions;
}

/**
 * Get global plugins configuration.
 * @return {Object} the global config hash
 */
export function getGlobalConfig() {
	return config['config'];
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
 * @param {PkgDesc} pkg the package descriptor
 * @return {Array} the instantiated Babel plugins
 */
export function getPlugins(phase, pkg) {
	const pluginsKey = phase === 'pre' ? 'plugins' : 'post-plugins';
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

/**
 * Get Babel config for a given package
 * @param {PkgDesc} pkg the package descriptor
 * @return {Object} a Babel configuration object as defined by its API
 */
export function getBabelConfig(pkg) {
	return getPackageConfig(pkg, '.babelrc', {});
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
 * Extra dependencies to add to the final bundle (in addition to those listed
 * under the dependencies section of package.json).
 * @return {Array} an array of package names
 */
export function getIncludeDependencies() {
	return config['include-dependencies'] || [];
}

/**
 * Whether or not to dump report
 * @return {boolean}
 */
export function isDumpReport() {
	return config['dump-report'] || false;
}

/**
 * Get versions information
 * @return {void}
 */
export function getVersionsInfo() {
	const pkgJson = require('../package.json');

	let info = {
		'liferay-npm-bundler': pkgJson.version,
	};

	info = Object.assign(info, getPluginVersions());

	return info;
}
/**
 * Get version numbers of all plugins used in the build.
 * @return {Object} a map of {plugin-name: version} values
 */
function getPluginVersions() {
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
 * @param {PkgDesc} pkg the package descriptor
 * @param  {String} section the section name (like 'plugins', '.babelrc', ...)
 * @param  {Object} defaultValue default value if not configured
 * @return {Object} a configuration object
 */
function getPackageConfig(pkg, section, defaultValue = undefined) {
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
