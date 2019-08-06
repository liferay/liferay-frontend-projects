/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const deepMerge = require('./deepMerge');
const getUserConfig = require('./getUserConfig');

/**
 * Require "simple" globs (ie. disallowing compound extensions like
 * ".{js,scss}") so that we can trivially explode them for processing with
 * specific tools per file-type.
 */
function validateGlobs(config) {
	['fix', 'check'].forEach(key => {
		const globs = config[key] || [];

		globs.forEach(glob => {
			if (!glob.match(/\.\w+$/)) {
				throw new Error(
					`getMergedConfig(): glob "${glob}" must end with a simple extension`
				);
			}
		});
	});
}

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
			mergedConfig = deepMerge(
				[require('../config/babel'), getUserConfig('babel')],
				deepMerge.MODE.BABEL
			);
			break;

		case 'bundler':
			mergedConfig = deepMerge([
				require('../config/npm-bundler'),
				getUserConfig('npmbundler')
			]);
			break;

		case 'eslint':
			mergedConfig = deepMerge([
				require('../config/eslint.config'),
				getUserConfig('eslint')
			]);
			break;

		case 'jest':
			mergedConfig = deepMerge([
				require('../config/jest.config'),
				require('../utils/getJestModuleNameMapper')(),
				getUserConfig('jest')
			]);
			break;

		case 'prettier':
			mergedConfig = deepMerge([
				require('../config/prettier'),
				getUserConfig('prettier')
			]);
			break;

		case 'npmscripts': {
			let presetConfig = {};

			let userConfig = getUserConfig('npmscripts');

			// Use default config if no user config exists
			if (Object.keys(userConfig).length === 0) {
				userConfig = require('../config/npmscripts.config.js');
			}

			// Check for preset before creating config
			if (userConfig.preset) {
				presetConfig = require(userConfig.preset);
			}

			mergedConfig = deepMerge(
				[presetConfig, userConfig],
				deepMerge.MODE.OVERWRITE_ARRAYS
			);

			validateGlobs(mergedConfig);
			break;
		}

		default:
			throw new Error(`'${type}' is not a valid config`);
	}

	return pluck(mergedConfig, property);
}

module.exports = getMergedConfig;
