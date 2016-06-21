'use strict';

var _ = require('lodash');
var del = require('del');
var path = require('path');
var plugins = require('gulp-load-plugins')();

var KickstartPrompt = require('../lib/prompts/kickstart_prompt');
var lfrThemeConfig = require('../lib/liferay_theme_config');

var gutil = plugins.util;

module.exports = function(options) {
	var gulp = options.gulp;

	var pathSrc = options.pathSrc;

	gulp.task('kickstart', function(cb) {
		gutil.log(
			gutil.colors.yellow('Warning:'),
			'the',
			gutil.colors.cyan('kickstart'),
			'task will potentially overwrite files in your src directory'
		);

		KickstartPrompt.prompt({
			themeConfig: lfrThemeConfig.getConfig()
		}, function(answers) {
			var tempNodeModulesPath;
			var themeSrcPath;

			if (answers.modulePath) {
				themeSrcPath = answers.modulePath;
			}
			else if (answers.module) {
				tempNodeModulesPath = path.join(process.cwd(), '.temp_node_modules');

				themeSrcPath = path.join(tempNodeModulesPath, 'node_modules', answers.module, 'src');
			}

			if (themeSrcPath) {
				var globs = _.map(['css', 'images', 'js', 'templates'], function(folder) {
					return path.join(themeSrcPath, folder, '**/*');
				});

				gulp.src(globs, {
					base: themeSrcPath
				})
					.pipe(gulp.dest(pathSrc))
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
				gutil.log(gutil.colors.yellow('Theme not selected'));

				cb();
			}
		});
	});
};
