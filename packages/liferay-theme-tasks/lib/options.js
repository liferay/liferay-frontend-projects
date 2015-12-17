'use strict';

module.exports = function(options) {
	options = options || {};
	options.pathBuild = options.pathBuild || './build';
	options.pathDist = options.pathDist || './dist';
	options.pathSrc = options.pathSrc || './src';
	options.supportCompass = options.supportCompass || false;

	return options;
};