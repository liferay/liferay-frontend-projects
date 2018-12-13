const getUserConfig = require('./get-user-config');
const deepMerge = require('./deep-merge');

module.exports = function(type) {
	switch (type) {
		case 'babel':
			return deepMerge(
				getUserConfig('.babelrc', 'babel'),
				require('../config/babel')
			);
			break;
		case 'bundler':
			return deepMerge(
				getUserConfig('.npmbundlerrc'),
				require('../config/npm-bundler')
			);
			break;
		case 'npmscripts':
			return deepMerge(
				getUserConfig('.liferaynpmscriptsrc'),
				require('../config/liferay-npm-scripts')
			);
			break;
		default:
			console.log(`'${type}' is not a valid config`);
	}
};
