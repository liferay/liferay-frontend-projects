'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs-extra');
var gutil = require('gulp-util');
var lfrThemeConfig = require('../lib/liferay_theme_config.js');
var path = require('path');

var version = argv.v || argv.version;

var themeConfig = lfrThemeConfig.getConfig();

module.exports = function(options) {
	var gulp = options.gulp;

	if (_.startsWith(argv._[0], 'upgrade')) {
		version = version ? version.toString() : themeConfig.version;

		var modulePath = path.join(__dirname, '../lib/upgrade', version, 'upgrade.js');

		if (fs.existsSync(modulePath)) {
			require(modulePath)(options);
		}
		else {
			gutil.log(gutil.colors.red('It appears there are no tools for upgrading themes for', version));
		}
	}
}