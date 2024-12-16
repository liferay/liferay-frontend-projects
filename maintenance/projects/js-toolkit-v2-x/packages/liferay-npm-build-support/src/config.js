/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import project from 'liferay-npm-build-tools-common/lib/project';
import readJsonSync from 'read-json-sync';

let npmbuildrc = {};
let npmbundlerrc = {};

loadConfig();

/**
 * Load project configuration
 */
function loadConfig() {
	npmbuildrc = safeReadJsonSync(project.dir.join('.npmbuildrc').asNative);
	npmbundlerrc = project._npmbundlerrc;

	// Normalize configurations

	normalize(npmbuildrc, 'start', {
		ejected: false,
		dir: project.dir.join('.webpack').asPosix,
	});
	normalize(npmbuildrc, 'supportedLocales', []);
	normalize(npmbuildrc, 'webpack.mainModule', 'index.js');
	normalize(npmbuildrc, 'webpack.rules', []);
	normalize(npmbuildrc, 'webpack.extensions', ['.js']);
	normalize(npmbuildrc, 'webpack.port', null);
	normalize(npmbuildrc, 'webpack.proxy', {});

	normalize(
		npmbundlerrc,
		'create-jar.features.localization',
		'features/localization/Language'
	);
}

/**
 * Get the path to the local installation of Liferay (if any).
 * @return {string|undefined}
 */
export function getLiferayDir() {
	return npmbuildrc.liferayDir;
}

/**
 * Get the Microsoft Translator credentials
 * @return {string|undefined}
 */
export function getTranslatorTextKey() {
	return npmbuildrc.translatorTextKey;
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
 * @return {number}
 */
export function getWebpackPort() {
	return npmbuildrc.webpack.port;
}

/**
 * Get the webpack proxy to use.
 * @return {Object}
 */
export function getWebpackProxy() {
	return npmbuildrc.webpack.proxy;
}

/**
 * Get the list of supported locales
 * @return {Array<string>}
 */
export function getSupportedLocales() {
	return npmbuildrc.supportedLocales;
}

/**
 * Get the `npm run start` webpack's directory
 * @return {string}
 */
export function getStartDir() {
	return npmbuildrc.start.dir;
}

/**
 * Check if `npm run start` configuration was ejected
 * @return {boolean}
 */
export function isStartEjected() {
	return npmbuildrc.start.ejected;
}

/**
 * Set a property in a configuration object if it doesn't exist
 * @param {object} cfg
 * @param {string} propPath
 * @param {*} value
 */
function normalize(cfg, propPath, value) {
	if (!prop.has(cfg, propPath)) {
		prop.set(cfg, propPath, value);
	}
}

/**
 * Read a JSON file without failure if it doesn't exist.
 * @param {string} path
 * @return {object}
 */
function safeReadJsonSync(path) {
	try {
		return readJsonSync(path);
	}
	catch (err) {
		if (err.code !== 'ENOENT') {
			throw err;
		}
	}
}
