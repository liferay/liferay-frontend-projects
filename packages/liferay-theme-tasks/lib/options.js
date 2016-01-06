'use strict';

var options;

module.exports = function(config) {
	if (!options) {
		config = config || {};
		config.pathBuild = config.pathBuild || './build';
		config.pathDist = config.pathDist || './dist';
		config.pathSrc = config.pathSrc || './src';
		config.supportCompass = config.supportCompass || false;

		options = config;
	}

	return options;
};