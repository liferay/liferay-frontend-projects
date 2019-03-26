/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const sortKeys = require('sort-keys');
const getUserConfig = require('./get-user-config');
const deepMerge = require('./deep-merge');

/**
 * Helper to get JSON configs
 * @param {string} type Name of configuration
 */
module.exports = function(type) {
	switch (type) {
		case 'babel':
			return sortKeys(
				deepMerge(
					require('../config/babel'),
					getUserConfig('.babelrc', 'babel')
				)
			);

		case 'bundler':
			return sortKeys(
				deepMerge(
					require('../config/npm-bundler'),
					getUserConfig('.npmbundlerrc')
				)
			);

		case 'jest':
			return sortKeys(
				deepMerge(
					require('../config/jest'),
					getUserConfig('jest.config.js', 'jest')
				)
			);

		case 'npmscripts':
			return sortKeys(
				deepMerge(
					require('../config/liferay-npm-scripts'),
					require('../config/liferay-npm-scripts-build-deps-clay.json'),
					require('../config/liferay-npm-scripts-build-deps-liferay.json'),
					require('../config/liferay-npm-scripts-build-deps-metal.json'),
					getUserConfig('.liferaynpmscriptsrc')
				)
			);

		default:
			// eslint-disable-next-line no-console
			console.log(`'${type}' is not a valid config`);
	}
};
