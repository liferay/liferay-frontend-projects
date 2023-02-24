/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const deepMerge = require('./deepMerge');
const findRoot = require('./findRoot');
const flattenPkgName = require('./flattenPkgName');
const getDXPVersion = require('./getDXPVersion');
const getUserConfig = require('./getUserConfig');

/**
 * Pluck a specific property, `property`, from the configuration object,
 * `config`.
 *
 * If no property is specified, returns the entire object.
 */
function pluck(config, property) {
	if (!property) {
		return config;
	}

	if (!Object.hasOwnProperty.call(config, property)) {
		const keys = JSON.stringify(Object.keys(config));
		const missing = JSON.stringify(property);
		throw new Error(
			`getMergedConfig(): property ${missing} is missing from configuration (existing keys are: ${keys})`
		);
	}

	return config[property];
}

function isObject(maybeObject) {
	return (
		maybeObject &&
		Object.prototype.toString.call(maybeObject) === '[object Object]'
	);
}

/**
 * Returns a deep copy of `object`, with any instance of `property`
 * transformed using the `callback` (which should accept the value of
 * the property and return the new value).
 */
function filter(object, property, callback) {
	if (Array.isArray(object)) {
		return object.map((item) => filter(item, property, callback));
	}
	else if (isObject(object)) {
		return Object.entries(object).reduce((acc, [key, value]) => {
			return {
				...acc,
				[key]:
					key === property
						? callback(value)
						: filter(value, property, callback),
			};
		}, {});
	}
	else {
		return object;
	}
}

/**
 * We want to use @babel-preset/react as a default, but some projects use
 * babel-plugin-incremental-dom, and we cannot turn off the preset
 * without this hack; see:
 *
 *  - https://github.com/babel/babel/issues/3016
 *  - https://babeljs.io/docs/en/babel-preset-env/#exclude
 */
function hackilySupportIncrementalDOM(config) {
	const {liferay, ...rest} = config;

	const excludes = (liferay && liferay.excludes) || {};

	return Object.entries(excludes).reduce((acc, [property, values]) => {
		return filter(acc, property, (value) => {
			if (Array.isArray(value)) {
				return value.filter((v) => !values.includes(v));
			}
			else {
				return value;
			}
		});
	}, rest);
}

/**
 * Helper to get JSON configs
 * @param {string} type Name of configuration ("babel", "bundler", "jest" etc)
 * @param {string=} property Specific configuration property to extract. If not
 * supplied, the entire configuration object is returned.
 */
function getMergedConfig(type, property) {
	let mergedConfig;

	switch (type) {
		case 'babel':
			{
				const {major, minor} = getDXPVersion() || {};

				const baseConfig =
					major === undefined ||
					major > 7 ||
					(major === 7 && minor > 3)
						? require('../config/babel')
						: require('../config/babel-legacy');

				mergedConfig = deepMerge(
					[baseConfig, getUserConfig('babel')],
					deepMerge.MODE.BABEL
				);

				// (Temporary) special case required by:
				//
				// https://github.com/liferay/liferay-npm-tools/issues/303
				//
				// TODO: Remove once incremental-dom is no longer used in
				// liferay-portal.

				mergedConfig = hackilySupportIncrementalDOM(mergedConfig);
			}
			break;

		case 'bundler': {
			const {build} = getMergedConfig('npmscripts');

			let bundlerDefaults = {};

			if (build && build.bundler) {
				bundlerDefaults = build.bundler;
			}

			const userConfig = getUserConfig('npmbundler');

			if (userConfig.preset !== undefined) {
				mergedConfig = userConfig;
			}
			else {
				mergedConfig = deepMerge([bundlerDefaults, userConfig]);
			}
			break;
		}

		case 'eslint':
			mergedConfig = deepMerge([
				require('../config/eslint.config'),
				getUserConfig('eslint'),
			]);
			break;

		case 'jest':
			mergedConfig = deepMerge([
				require('../config/jest.config'),
				require('../utils/getJestModuleNameMapper')(),
				getUserConfig('jest'),
			]);
			break;

		case 'prettier':
			mergedConfig = deepMerge([
				require('../config/prettier'),
				getUserConfig('prettier', {upwards: true}),
			]);
			break;

		case 'npmscripts': {
			const rootDir = findRoot();

			let rootConfig = {};

			if (rootDir) {
				try {
					/* eslint-disable-next-line @liferay/no-dynamic-require */
					rootConfig = require(path.join(
						rootDir,
						'npmscripts.config'
					));
				}
				catch (error) {
					if (error.code !== 'MODULE_NOT_FOUND') {
						throw error;
					}
				}
			}

			if (process.cwd() === rootDir) {
				mergedConfig = deepMerge(
					[
						require('../config/npmscripts.config'),
						rootConfig.global || {},
					],
					deepMerge.MODE.NPMSCRIPTS
				);
			}
			else {
				mergedConfig = deepMerge(
					[
						require('../config/npmscripts.config'),

						// Temporary workaround until we re-evaluate global key

						{rules: rootConfig.global?.rules || {}},
						rootConfig,
						getUserConfig('npmscripts'),
					],
					deepMerge.MODE.NPMSCRIPTS
				);
			}

			normalizeNpmscriptsConfig(mergedConfig);
			break;
		}

		case 'stylelint':
			mergedConfig = deepMerge([
				require('../config/stylelint'),
				getUserConfig('stylelint'),
			]);
			break;

		case 'terser':
			mergedConfig = deepMerge([
				require('../config/terser.config'),
				getUserConfig('terser'),
			]);
			break;

		default:
			throw new Error(`'${type}' is not a valid config`);
	}

	return pluck(mergedConfig, property);
}

function normalizeNpmscriptsConfig(mergedConfig) {
	if (mergedConfig.build?.main) {
		mergedConfig.build.babel = false;
		mergedConfig.build.bundler = false;

		if (mergedConfig.build.exports === undefined) {
			mergedConfig.build.exports = [];
		}
	}

	if (Array.isArray(mergedConfig.build?.exports)) {

		// Normalize exports

		mergedConfig.build.exports = mergedConfig.build.exports.map(
			(exportsItem) => {
				if (typeof exportsItem === 'string') {
					exportsItem = {
						path: exportsItem,
					};
				}

				// Compute output file name: for the case of .css files, we want webpack
				// to create a .js file with the same name as the CSS file and next to
				// its output. That file is never used (as webpack leaves it empty), but
				// it allows our exports CSS loader to put the valid .js stub in the
				// proper place (__liferay__/exports).

				if (!exportsItem.name) {
					if (exportsItem.path.startsWith('.')) {
						throw new Error(
							'Internal exports must specify name and path'
						);
					}

					const flatPkgName = flattenPkgName(exportsItem.path);

					exportsItem.name = exportsItem.path.endsWith('.css')
						? `__liferay__/css/${flatPkgName.replace(/\.css$/, '')}`
						: `__liferay__/exports/${flatPkgName}`;
				}

				// Prefix exports names with '__liferay__', since we don't want
				// to force users to specify it in the configuration

				if (!exportsItem.name.startsWith('__liferay__/')) {
					exportsItem.name = `__liferay__/${exportsItem.name}`;
				}
				else {
					throw new Error(
						'Export names should not begin with __liferay__/ ' +
							'since it is automatically added by the build.'
					);
				}

				return exportsItem;
			}
		);

		// Auto-generate liferay-npm-bundler excludes based on exports

		if (mergedConfig.build.bundler !== false) {
			mergedConfig.build.bundler.exclude = {
				'*': true,
			};
		}
	}
}

module.exports = getMergedConfig;
