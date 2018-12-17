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
		case 'npmscripts':
			return sortKeys(
				deepMerge(
					getUserConfig('.liferaynpmscriptsrc'),
					require('../config/liferay-npm-scripts')
				)
			);
			break;
		default:
			console.log(`'${type}' is not a valid config`);
	}
};
