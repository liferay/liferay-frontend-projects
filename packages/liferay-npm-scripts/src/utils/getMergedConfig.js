/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const deepMerge = require('./deepMerge');
const getUserConfig = require('./getUserConfig');

/**
 * Helper to get JSON configs
 * @param {string} type Name of configuration
 */
function getMergedConfig(type) {
	switch (type) {
		case 'babel':
			return deepMerge(
				[require('../config/babel'), getUserConfig('babel')],
				deepMerge.MODE.BABEL
			);

		case 'bundler':
			return deepMerge([
				require('../config/npm-bundler'),
				getUserConfig('npmbundler')
			]);

		case 'eslint':
			mergedConfig = deepMerge([
				require('../config/eslint'),
				getUserConfig('eslint')
			]);
			break;

		case 'jest':
			return deepMerge([
				require('../config/jest'),
				getUserConfig('jest')
			]);

		case 'prettier':
			return deepMerge([
				require('../config/prettier'),
				getUserConfig('prettier')
			]);

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

			return deepMerge(
				[presetConfig, userConfig],
				deepMerge.MODE.OVERWRITE_ARRAYS
			);
		}

		default:
			throw new Error(`'${type}' is not a valid config`);
	}
}

module.exports = getMergedConfig;
