import prop from 'dot-prop';
import fs from 'fs';

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
 * @return {boolean|string} a boolean or a string forcing a capability version
 * 				number (or 'any' to leave version unbounded)
 */
export function getRequireJsExtender() {
	const jarConfig = getNormalizedJarConfig();

	return prop.get(
		jarConfig,
		'features.js-extender',
		// TODO: deprecated 'auto-deploy-portlet', remove for the next major version
		prop.get(jarConfig, 'auto-deploy-portlet', true)
	);
}

/**
 * Get localization bundle path.
 * @return {string} the full path of file or undefined if not configured
 */
export function getLocalizationFile() {
	const jarConfig = getNormalizedJarConfig();

	let defaultValue = undefined;

	if (fs.existsSync('./features/localization/Language.properties')) {
		defaultValue = 'features/localization/Language';
	}

	return prop.get(jarConfig, 'features.localization', defaultValue);
}

/**
 * Get metatype file path.
 * @return {string} the full path of file or undefined if not configured
 */
export function getMetatypeFile() {
	const jarConfig = getNormalizedJarConfig();

	let defaultValue = undefined;

	if (fs.existsSync('./features/settings.xml')) {
		defaultValue = 'features/settings.xml';
	}

	return prop.get(jarConfig, 'features.settings', defaultValue);
}

/**
 * Get the configured web context path value.
 * @return {string}
 */
export function getWebContextPath() {
	const jarConfig = getNormalizedJarConfig();

	return prop.get(
		jarConfig,
		'features.web-context',
		// TODO: deprecated 'web-context-path', remove for the next major version
		prop.get(
			jarConfig,
			'web-context-path',
			// TODO: deprecated 'osgi.Web-ContextPath', remove for the next major version
			prop.get(
				pkgJson,
				'osgi.Web-ContextPath',
				`/${pkgJson.name}-${pkgJson.version}`
			)
		)
	);
}

/**
 * Get the output directory for JAR files. Defaults to getOutputDir() if none is
 * specified.
 * @return {string}
 */
export function getOutputDir() {
	const jarConfig = getNormalizedJarConfig();

	return prop.get(jarConfig, 'output-dir', base.getOutputDir());
}

/**
 * Get normalized JAR config as an object. Note that if JAR config is false this
 * method returns an object too so it only makes sense in a context where
 * cfg.isCreateJar() has already been checked and returned true.
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
