import {getPackageDir} from 'liferay-npm-build-tools-common/lib/packages';
import path from 'path';
import readJsonSync from 'read-json-sync';
import resolveModule from 'resolve';

let pluginsBaseDir = '.';
let config = loadConfig();

/**
 * Load configuration at startup.
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
  let dir = config['output'] || 'build/resources/main/META-INF/resources';
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

  let plugins = [];

  if (config[pkg.id] && config[pkg.id][pluginsKey]) {
    plugins = config[pkg.id][pluginsKey];
  } else if (config['*'] && config['*'][pluginsKey]) {
    plugins = config['*'][pluginsKey];
  }

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
  let babelConfig = {};

  if (config[pkg.id] && config[pkg.id]['.babelrc']) {
    babelConfig = config[pkg.id]['.babelrc'];
  } else if (config[pkg.name] && config[pkg.name]['.babelrc']) {
    babelConfig = config[pkg.name]['.babelrc'];
  } else if (config['*'] && config['*']['.babelrc']) {
    babelConfig = config['*']['.babelrc'];
  }

  return babelConfig;
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
