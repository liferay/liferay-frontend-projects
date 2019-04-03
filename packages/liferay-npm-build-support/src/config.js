/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import path from 'path';
import prop from 'dot-prop';
import readJsonSync from 'read-json-sync';

const projectDir = process.cwd();
let npmbuildrc = {};
let npmbundlerrc = {};

loadConfig();

/**
 * Load project configuration
 */
function loadConfig() {
	npmbuildrc = safeReadJsonSync(path.join(projectDir, '.npmbuildrc'));
	npmbundlerrc = safeReadJsonSync(path.join(projectDir, '.npmbundlerrc'));

	// TODO: Extract this to liferay-npm-build-tools-common (see #213)

	// Normalize configurations
	normalize(npmbuildrc, 'webpack.mainModule', 'index.js');
	normalize(npmbuildrc, 'webpack.rules', []);
	normalize(npmbuildrc, 'webpack.extensions', ['.js']);
	normalize(npmbuildrc, 'webpack.port', 8080);

	normalize(npmbundlerrc, 'create-jar.output-dir', 'build');
	normalize(
		npmbundlerrc,
		'create-jar.features.localization',
		'features/localization/Language'
	);
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
	return prop.get(npmbundlerrc, 'create-jar.output-dir');
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
 * Get the list of localization files for the project indexed by locale
 * abbreviation
 * @return {object}
 */
export function getLocalizationFiles() {
	const localizationFile = prop.get(
		npmbundlerrc,
		'create-jar.features.localization'
	);
	const localizationDir = path.dirname(localizationFile);

	const files = fs.readdirSync(localizationDir);

	return files.reduce(
		(map, file) => (
			(map[getLocale(file)] = path.join(localizationDir, file)), map
		),
		{}
	);
}

/**
 * Get the locale of a .properties file based on its name
 * @param {string} fileName
 * @return {string}
 */
function getLocale(fileName) {
	const start = fileName.lastIndexOf('_');

	if (start == -1) {
		return 'default';
	}

	const end = fileName.lastIndexOf('.properties');

	return fileName.substring(start + 1, end);
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
	} catch (err) {
		if (err.code !== 'ENOENT') {
			throw err;
		}
	}
}
