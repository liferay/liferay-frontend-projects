import readJsonSync from 'read-json-sync';

const projectDir = process.cwd();
let config = {};

loadConfig();

/**
 * Load project configuration
 */
function loadConfig() {
	config = readJsonSync(`${projectDir}/.npmbuildrc`);

	// Normalize configuration
	config.liferayDir = config.liferayDir || undefined;
	config.webpack = config.webpack || {};
	config.webpack.mainModule = config.webpack.mainModule || 'index.js';
	config.webpack.rules = config.webpack.rules || [];
	config.webpack.extensions = config.webpack.extensions || {};
}

/**
 * Get project's absolute path
 * @return {string}
 */
export function getProjectDir() {
	return projectDir;
}

/**
 * Get the path to the local installation of Liferay (if any).
 * @return {string|undefined}
 */
export function getLiferayDir() {
	return config.liferayDir;
}

/**
 * Get the main module path to be used when building with webpack.
 * @return {string}
 */
export function getWebpackMainModule() {
	return config.webpack.mainModule;
}

/**
 * Get the webpack rules to use.
 * @return {Array}
 */
export function getWebpackRules() {
	return config.webpack.rules;
}

/**
 * Get the webpack extensions to use.
 * @return {Object}
 */
export function getWebpackExtensions() {
	return config.webpack.extensions;
}
