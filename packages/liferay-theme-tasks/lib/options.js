'use strict';

var _ = require('lodash');
var minimist = require('minimist');

var lfrThemeConfig = require('./liferay_theme_config');

var options;

module.exports = function(config) {
	if (!options || config) {
		config = config || {};
		config.argv = minimist(process.argv.slice(2));
		config.pathBuild = config.pathBuild || './build';
		config.pathDist = config.pathDist || './dist';
		config.pathSrc = config.pathSrc || './src';
		config.rubySass = config.rubySass || false;
		config.sassOptions = config.sassOptions || {};

		var themeConfig = lfrThemeConfig.getConfig();

		_.assign(config, themeConfig);

		options = config;
	}

	return options;
};
