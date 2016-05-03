'use strict';

var _ = require('lodash');
var del = require('del');
var exec = require('child_process').exec;
var fs = require('fs-extra');
var KickstartPrompt = require('../lib/prompts/kickstart_prompt');
var lfrThemeConfig = require('../lib/liferay_theme_config');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var themeUtil = require('../lib/util');

var gutil = plugins.util;

var themeConfig = lfrThemeConfig.getConfig(true);

module.exports = function(options) {
	var gulp = options.gulp;

	var pathSrc = options.pathSrc;

	var runSequence = require('run-sequence').use(gulp);

	var argv = options.argv;

	gulp.task('kickstart', function(cb) {
		new KickstartPrompt(function(kickstartData) {
			var tempNodeModulesPath;
			var themeSrcPath;

			if (kickstartData.npmTheme) {
				tempNodeModulesPath = path.join(process.cwd(), '.temp_node_modules');

				themeSrcPath = path.join(tempNodeModulesPath, 'node_modules', kickstartData.npmTheme, 'src');
			}
			else if (kickstartData.globalTheme) {
				themeSrcPath = path.join(kickstartData.globalTheme, 'src');
			}

			if (themeSrcPath) {
				var globs = _.map(['css', 'images', 'js', 'templates'], function(folder) {
					return path.join(themeSrcPath, folder, '**/*');
				});

				gulp.src(globs, {
						base: themeSrcPath
					})
					.pipe(gulp.dest('src'))
					.on('end', function() {
						if (tempNodeModulesPath) {
							del([tempNodeModulesPath], cb);
						}
						else {
							cb();
						}
					});
			}
			else {
				cb();
			}
		});
	});
};
