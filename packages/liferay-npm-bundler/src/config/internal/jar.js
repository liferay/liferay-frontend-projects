/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import fs from 'fs';

import * as base from '../index';

const notifiedWarnings = {
	settings: false,
};

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
 * Get configuration file path.
 * @return {string} the full path of file or undefined if not configured
 */
export function getConfigurationFile() {
	const jarConfig = getNormalizedJarConfig();

	let defaultValue = undefined;

	if (fs.existsSync('./features/configuration.json')) {
		defaultValue = 'features/configuration.json';
	}

	return prop.get(jarConfig, 'features.configuration', defaultValue);
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
 * Get the output file name for JAR files. Defaults to an empty string if none is
 * specified, requiring the caller to generate the default based upon the package 
 * name and version specified in the package.json.
 * @return {string}
 */
export function getOutputFilename() {
	const jarConfig = getNormalizedJarConfig();

	return prop.get(jarConfig, 'output-filename', '');
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

	const jarConfig = config['create-jar'];

	// Make deprecation checks
	if (
		!notifiedWarnings.settings &&
		prop.get(jarConfig, 'features.settings') !== undefined
	) {
		notifiedWarnings.settings = true;

		console.warn(
			'\n' +
				"👀 WARNING: configuration value 'create-jar.configuration.settings' is no longer supported\n" +
				'            (see https://tinyurl.com/settings-not-supported for more information)\n'
		);
	}

	return jarConfig;
}
