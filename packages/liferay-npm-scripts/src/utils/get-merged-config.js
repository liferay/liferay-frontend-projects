/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const sortKeys = require('sort-keys');

const deepMerge = require('./deep-merge');
const getUserConfig = require('./get-user-config');

/**
 * Helper to get JSON configs
 * @param {string} type Name of configuration
 */
function getMergedConfig(type) {
	switch (type) {
		case 'babel':
			return sortKeys(
				deepMerge(
					[
						require('../config/babel'),
						getUserConfig('.babelrc', 'babel')
					],
					deepMerge.MODE.BABEL
				)
			);

		case 'bundler':
			return sortKeys(
				deepMerge([
					require('../config/npm-bundler'),
					getUserConfig('.npmbundlerrc')
				])
			);

		case 'jest':
			return sortKeys(
				deepMerge([
					require('../config/jest'),
					getUserConfig('jest.config.js', 'jest')
				])
			);

		case 'npmscripts': {
			let presetConfig = {};

			let userConfig = getUserConfig('npmscripts.config.js');

			// Use default config if no user config exists
			if (Object.keys(userConfig).length === 0) {
				userConfig = require('../config/npmscripts.config.js');
			}

			// Check for preset before creating config
			if (userConfig.preset) {
				presetConfig = require(userConfig.preset);
			}

			return sortKeys(
				deepMerge(
					[presetConfig, userConfig],
					deepMerge.MODE.OVERWRITE_ARRAYS
				)
			);
		}

		default:
			throw new Error(`'${type}' is not a valid config`);
	}
}

module.exports = getMergedConfig;
