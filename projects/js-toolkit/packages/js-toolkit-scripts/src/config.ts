/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Project} from '@liferay/js-toolkit-core';
import prop from 'dot-prop';
import readJsonSync from 'read-json-sync';

export const project = new Project('.');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let npmbuildrc: any = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let configuration: any = {};

loadConfig();

/**
 * Load project configuration
 */
function loadConfig(): void {
	npmbuildrc = safeReadJsonSync(project.dir.join('.npmbuildrc').asNative);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	configuration = (project as any)._configuration;

	// Normalize configurations

	normalize(npmbuildrc, 'supportedLocales', []);
	normalize(npmbuildrc, 'webpack.mainModule', 'index.js');
	normalize(npmbuildrc, 'webpack.rules', []);
	normalize(npmbuildrc, 'webpack.extensions', ['.js']);
	normalize(npmbuildrc, 'webpack.port', null);
	normalize(npmbuildrc, 'webpack.proxy', {});

	normalize(
		configuration,
		'create-jar.features.localization',
		'features/localization/Language'
	);
}

/**
 * Get the path to the local installation of Liferay (if any).
 * @return {string|undefined}
 */
export function getLiferayDir(): string | undefined {
	return npmbuildrc.liferayDir;
}

/**
 * Get the Microsoft Translator credentials
 * @return {string|undefined}
 */
export function getTranslatorTextKey(): string | undefined {
	return npmbuildrc.translatorTextKey;
}

/**
 * Get the main module path to be used when building with webpack.
 * @return {string}
 */
export function getWebpackMainModule(): string {
	return npmbuildrc.webpack.mainModule;
}

/**
 * Get the webpack rules to use.
 * @return {Array}
 */
export function getWebpackRules(): object[] {
	return npmbuildrc.webpack.rules;
}

/**
 * Get the webpack extensions to use.
 * @return {Object}
 */
export function getWebpackExtensions(): object {
	return npmbuildrc.webpack.extensions;
}

/**
 * Get the webpack port to use.
 * @return {number}
 */
export function getWebpackPort(): number {
	return npmbuildrc.webpack.port;
}

/**
 * Get the webpack proxy to use.
 * @return {Object}
 */
export function getWebpackProxy(): object {
	return npmbuildrc.webpack.proxy;
}

/**
 * Get the list of supported locales
 * @return {Array<string>}
 */
export function getSupportedLocales(): string[] {
	return npmbuildrc.supportedLocales;
}

/**
 * Set a property in a configuration object if it doesn't exist
 * @param {object} cfg
 * @param {string} propPath
 * @param {*} value
 */
function normalize(cfg, propPath, value): void {
	if (!prop.has(cfg, propPath)) {
		prop.set(cfg, propPath, value);
	}
}

/**
 * Read a JSON file without failure if it doesn't exist.
 * @param {string} path
 * @return {object}
 */
function safeReadJsonSync(path): object {
	try {
		return readJsonSync(path);
	}
	catch (error) {
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}
}
