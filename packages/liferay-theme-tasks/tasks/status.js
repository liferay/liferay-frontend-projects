'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var gutil = require('gulp-util');
var lfrThemeConfig = require('../lib/liferay_theme_config');

var status = argv.status || argv.s;

function prettifyThemeConfig() {
	var themeConfig = lfrThemeConfig.getConfig();

	var baseTheme = themeConfig.baseTheme;

	if (baseTheme) {
		var baseThemeName = baseTheme.name || baseTheme;

		console.log(gutil.colors.cyan('Base theme:'), gutil.colors.green(baseThemeName, baseTheme.version ? 'v' + baseTheme.version : ''));
	}

	var themeletDependencies = themeConfig.themeletDependencies;

	if (themeletDependencies) {
		console.log(gutil.colors.cyan('Themelets:'));

		_.forEach(themeletDependencies, function(item, index) {
			console.log(' -', gutil.colors.green(item.name, 'v' + item.version));
		});
	}
}

module.exports = function(options) {
	var gulp = options.gulp;

	gulp.task(
		'status',
		function(cb) {
			prettifyThemeConfig();

			cb();
		}
	);
}