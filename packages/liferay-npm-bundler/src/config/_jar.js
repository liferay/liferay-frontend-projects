import * as base from './index';

let config;
let pkgJson;

/**
 * Initialize submodule
 * @param {object} state
 * @return {void}
 */
export function init(state) {
	config = state.config;
	pkgJson = state.pkgJson;
}

/**
 * Whether or not to add a manifest header in JAR file to make the JS extender
 * process this bundle.
 * @return {boolean}
 */
export function isRequireJsExtender() {
	const jarConfig = getNormalizedJarConfig();

	if (
		jarConfig['features'] &&
		jarConfig['features']['js-extender'] === false
	) {
		return false;
	}

	// TODO: deprecated branch, remove for the next major version
	if (jarConfig['auto-deploy-portlet'] === false) {
		return false;
	}

	return true;
}

/**
 * Get localization bundle path.
 * @return {string} the full path of file or undefined if not configured
 */
export function getLocalizationFile() {
	const jarConfig = getNormalizedJarConfig();

	if (jarConfig['features'] && jarConfig['features']['localization']) {
		return jarConfig['features']['localization'];
	}

	return undefined;
}

/**
 * Get metatype file path.
 * @return {string} the full path of file or undefined if not configured
 */
export function getMetatypeFile() {
	const jarConfig = getNormalizedJarConfig();

	if (jarConfig['features'] && jarConfig['features']['settings']) {
		return jarConfig['features']['settings'];
	}

	return undefined;
}

/**
 * Get the configured web context path value.
 * @return {string}
 */
export function getWebContextPath() {
	const jarConfig = getNormalizedJarConfig();

	if (jarConfig['features'] && jarConfig['features']['web-context']) {
		return jarConfig['features']['web-context'];
	}

	// TODO: deprecated branch, remove for the next major version
	if (jarConfig['web-context-path']) {
		return jarConfig['web-context-path'];
	}

	// TODO: deprecated branch, remove for the next major version
	if (pkgJson.osgi && pkgJson.osgi['Web-ContextPath']) {
		return pkgJson.osgi['Web-ContextPath'];
	}

	return `/${pkgJson.name}-${pkgJson.version}`;
}

/**
 * Get the output directory for JAR files. Defaults to getOutputDir() if none is
 * specified.
 * @return {string}
 */
export function getOutputDir() {
	const jarConfig = getNormalizedJarConfig();

	if (jarConfig['output-dir']) {
		return jarConfig['output-dir'];
	}

	return base.getOutputDir();
}

/**
 * Get normalized JAR config
 * @return {object}
 */
function getNormalizedJarConfig() {
	if (config['create-jar'] === undefined) {
		return {};
	}

	if (typeof config['create-jar'] !== 'object') {
		return {};
	}

	return config['create-jar'];
}
