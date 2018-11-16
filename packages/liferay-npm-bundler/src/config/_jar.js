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
 * Whether or not to add manifest header in JAR file to make the Portal auto
 * deploy a portlet.
 * @return {boolean}
 */
export function isAutoDeployPortlet() {
	if (!base.isCreateJar()) {
		return false;
	}

	if (typeof config['create-jar'] === 'object') {
		if (config['create-jar']['auto-deploy-portlet'] === false) {
			return false;
		}
	}

	return true;
}

/**
 * Get the configured web context path value.
 * @return {string}
 */
export function getWebContextPath() {
	if (
		typeof config['create-jar'] === 'object' &&
		config['create-jar']['web-context-path']
	) {
		return config['create-jar']['web-context-path'];
	}

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
	if (
		typeof config['create-jar'] === 'object' &&
		config['create-jar']['output-dir']
	) {
		return config['create-jar']['output-dir'];
	}

	return base.getOutputDir();
}
