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
					getUserConfig('.babelrc', 'babel'),
					require('../config/babel')
				)
			);
			break;
		case 'bundler':
			return sortKeys(
				deepMerge(
					getUserConfig('.npmbundlerrc'),
					require('../config/npm-bundler')
				)
			);
			break;
		case 'jest':
			return sortKeys(
				deepMerge(
					getUserConfig('jest.config.js', 'jest'),
					require('../config/jest')
				)
			);
			break;
		case 'npmscripts':
			return sortKeys(
				deepMerge(
					getUserConfig('.liferaynpmscriptsrc'),
					require('../config/liferay-npm-scripts'),
					require('../config/liferay-npm-scripts-build-deps-clay.json'),
					require('../config/liferay-npm-scripts-build-deps-liferay.json'),
					require('../config/liferay-npm-scripts-build-deps-metal.json')
				)
			);
			break;
		default:
			console.log(`'${type}' is not a valid config`);
	}
};
