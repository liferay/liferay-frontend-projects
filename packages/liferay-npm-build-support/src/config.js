import readJsonSync from 'read-json-sync';

const projectDir = process.cwd();
let npmbuildrc = {};
let npmbundlerrc = {};

loadConfig();

/**
 * Load project configuration
 */
function loadConfig() {
	npmbuildrc = safeReadJsonSync(`${projectDir}/.npmbuildrc`);
	npmbundlerrc = safeReadJsonSync(`${projectDir}/.npmbundlerrc`);

	// Normalize configuration
	npmbuildrc.liferayDir = npmbuildrc.liferayDir || undefined;
	npmbuildrc.webpack = npmbuildrc.webpack || {};
	npmbuildrc.webpack.mainModule = npmbuildrc.webpack.mainModule || 'index.js';
	npmbuildrc.webpack.rules = npmbuildrc.webpack.rules || [];
	npmbuildrc.webpack.extensions = npmbuildrc.webpack.extensions || ['.js'];
	npmbuildrc.webpack.port = npmbuildrc.webpack.port || 8080;

	npmbundlerrc['create-jar'] = npmbundlerrc['create-jar'] || {};
	// TODO: Extract this to liferay-npm-build-tools-common (see #213)
	npmbundlerrc['create-jar']['output-dir'] =
		npmbundlerrc['create-jar']['output-dir'] || 'build';
}

/**
 * Get project's absolute path
 * @return {string}
 */
export function getProjectDir() {
	return projectDir;
}

/**
 * Get project's output directory
 * @return {string}
 */
export function getOutputDir() {
	return npmbundlerrc['create-jar']['output-dir'];
}

/**
 * Get the path to the local installation of Liferay (if any).
 * @return {string|undefined}
 */
export function getLiferayDir() {
	return npmbuildrc.liferayDir;
}

/**
 * Get the main module path to be used when building with webpack.
 * @return {string}
 */
export function getWebpackMainModule() {
	return npmbuildrc.webpack.mainModule;
}

/**
 * Get the webpack rules to use.
 * @return {Array}
 */
export function getWebpackRules() {
	return npmbuildrc.webpack.rules;
}

/**
 * Get the webpack extensions to use.
 * @return {Object}
 */
export function getWebpackExtensions() {
	return npmbuildrc.webpack.extensions;
}

/**
 * Get the webpack port to use.
 * @return {Number}
 */
export function getWebpackPort() {
	return npmbuildrc.webpack.port;
}

/**
 * Read a JSON file without failure if it doesn't exist.
 * @param {string} path
 * @return {object}
 */
function safeReadJsonSync(path) {
	try {
		return readJsonSync(path);
	} catch (err) {
		if (err.code !== 'ENOENT') {
			throw err;
		}
	}
}
