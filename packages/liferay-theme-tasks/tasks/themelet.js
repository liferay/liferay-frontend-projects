'use strict';

var _ = require('lodash');
var async = require('async');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var vinylPaths = require('vinyl-paths');

var lfrThemeConfig = require('../lib/liferay_theme_config');

var gutil = plugins.util;

var themeConfig = lfrThemeConfig.getConfig();

var CWD = process.cwd();

var FORWARD_SLASH = '/';

module.exports = function(options) {
	var gulp = options.gulp;

	var pathBuild = options.pathBuild;

	var runSequence = require('run-sequence').use(gulp);

	gulp.task('build:themelets', function(cb) {
		runSequence(
			['build:themelet-src'],
			['build:themelet-css-inject', 'build:themelet-js-inject'],
			cb
		);
	});

	gulp.task('build:themelet-css-inject', function(cb) {
		var themeSrcPaths = path.join(pathBuild, 'themelets', '**', 'css', '**/*.+(css|scss)');

		var injected = false;
		var themeletSources = false;

		var sources = gulp.src(themeSrcPaths, {
			read: false
		}).pipe(vinylPaths(function(path, cb) {
			themeletSources = true;

			cb();
		}));

		var fileName = themeConfig.version === '6.2' ? 'custom.css' : '_custom.scss';

		gulp.src(path.join(pathBuild, 'css', fileName))
			.pipe(plugins.inject(sources, {
				starttag: '/* inject:imports */',
				endtag: '/* endinject */',
				transform: function(filePath) {
					injected = true;

					var filePathArray = getThemeletFilePathArray(filePath);

					filePath = '..' + FORWARD_SLASH + filePathArray.join(FORWARD_SLASH);

					return '@import "' + filePath + '";';
				}
			}))
			.pipe(gulp.dest(path.join(pathBuild, 'css')))
			.on('end', function() {
				if (!injected && themeletSources && !_.isEmpty(themeConfig.themeletDependencies)) {
					var colors = gutil.colors;

					gutil.log(colors.yellow('Warning:'), 'Failed to automatically inject themelet styles. Make sure inject tags are present in', colors.magenta(fileName));
				}

				cb();
			});
	});

	gulp.task('build:themelet-js-inject', function(cb) {
		var themeSrcPaths = path.join(pathBuild, 'themelets', '**', 'js', '**/*.js');

		var injected = false;
		var themeletSources = false;

		var sources = gulp.src(themeSrcPaths, {
			read: false
		}).pipe(vinylPaths(function(path, cb) {
			themeletSources = true;

			cb();
		}));

		var defaultTemplateLanguage = 'ftl';

		if (themeConfig.version === '6.2') {
			defaultTemplateLanguage = 'vm';
		}

		var templateLanguage = themeConfig.templateLanguage || defaultTemplateLanguage;

		var themeRootPath = '${theme_display.getPathThemeRoot()}';

		if (templateLanguage === 'vm') {
			themeRootPath = '$theme_display.getPathThemeRoot()';
		}

		gulp.src(path.join(pathBuild, 'templates/portal_normal.' + templateLanguage))
			.pipe(plugins.inject(sources, {
				endtag: '<!-- endinject -->',
				starttag: '<!-- inject:js -->',
				transform: function(filePath) {
					injected = true;

					var filePathArray = getThemeletFilePathArray(filePath);

					filePath = filePathArray.join(FORWARD_SLASH);

					return '<script src="' + themeRootPath + FORWARD_SLASH + filePath + '"></script>';
				}
			}))
			.pipe(gulp.dest(path.join(pathBuild, 'templates')))
			.on('end', function() {
				if (!injected && themeletSources && !_.isEmpty(themeConfig.themeletDependencies)) {
					var colors = gutil.colors;

					gutil.log(colors.yellow('Warning:'), 'Failed to automatically inject themelet js. Make sure inject tags are present in', colors.magenta('portal_normal.' + templateLanguage));
				}

				cb();
			});
	});

	gulp.task('build:themelet-src', function(cb) {
		runThemeletDependenciesSeries(function(item, index, done) {
			gulp.src(path.resolve(CWD, 'node_modules', index, 'src', '**', '*'))
				.pipe(gulp.dest(path.join(pathBuild, 'themelets', index)))
				.on('end', done);
		}, cb);
	});

	function runThemeletDependenciesSeries(asyncTask, cb) {
		var themeletStreamMap = _.map(getThemeletDependencies(), function(item, index) {
			return _.bind(asyncTask, this, item, index);
		});

		async.series(themeletStreamMap, cb);
	}
};

function getThemeletFilePathArray(filePath) {
	var filePathArray = path.join(filePath).split(path.sep);

	filePathArray = filePathArray.slice(filePathArray.indexOf('themelets'), filePathArray.length);

	return filePathArray;
}

function getThemeletDependencies() {
	var packageJSON = require(path.join(CWD, 'package.json'));

	var themeletDependencies;

	if (packageJSON.liferayTheme && packageJSON.liferayTheme.themeletDependencies) {
		themeletDependencies = packageJSON.liferayTheme.themeletDependencies;
	}

	return themeletDependencies;
}
