'use strict';

let _ = require('lodash');
let async = require('async');
let path = require('path');
let plugins = require('gulp-load-plugins')();
let vinylPaths = require('vinyl-paths');

let divert = require('../lib/divert');
let lfrThemeConfig = require('../lib/liferay_theme_config');

let gutil = plugins.util;

let themeConfig = lfrThemeConfig.getConfig();

let CWD = process.cwd();

let FORWARD_SLASH = '/';

module.exports = function(options) {
	let gulp = options.gulp;

	let pathBuild = options.pathBuild;

	let runSequence = require('run-sequence').use(gulp);

	gulp.task('build:themelets', function(cb) {
		runSequence(
			['build:themelet-src'],
			['build:themelet-css-inject', 'build:themelet-js-inject'],
			cb
		);
	});

	gulp.task('build:themelet-css-inject', function(cb) {
		let themeSrcPaths = path.join(
			pathBuild,
			'themelets',
			'**',
			'css',
			'**/*.+(css|scss)'
		);

		let injected = false;
		let themeletSources = false;

		let sources = gulp
			.src(themeSrcPaths, {
				read: false,
			})
			.pipe(
				vinylPaths(function(path, cb) {
					themeletSources = true;

					cb();
				})
			);

		let fileName = divert('themelet').customCssFileName;

		gulp
			.src(path.join(pathBuild, 'css', fileName))
			.pipe(
				plugins.inject(sources, {
					endtag: '/* endinject */',
					starttag: '/* inject:imports */',
					transform: function(filePath) {
						injected = true;

						let filePathArray = getThemeletFilePathArray(filePath);

						filePath =
							'..' +
							FORWARD_SLASH +
							filePathArray.join(FORWARD_SLASH);

						return '@import "' + filePath + '";';
					},
				})
			)
			.pipe(gulp.dest(path.join(pathBuild, 'css')))
			.on('end', function() {
				if (
					!injected &&
					themeletSources &&
					!_.isEmpty(themeConfig.themeletDependencies)
				) {
					let colors = gutil.colors;

					gutil.log(
						colors.yellow('Warning:'),
						'Failed to automatically inject themelet styles. Make sure inject tags are present in',
						colors.magenta(fileName)
					);
				}

				cb();
			});
	});

	gulp.task('build:themelet-js-inject', function(cb) {
		let themeSrcPaths = path.join(
			pathBuild,
			'themelets',
			'**',
			'js',
			'**/*.js'
		);

		let injected = false;
		let themeletSources = false;

		let sources = gulp
			.src(themeSrcPaths, {
				read: false,
			})
			.pipe(
				vinylPaths(function(path, cb) {
					themeletSources = true;

					cb();
				})
			);

		let defaultTemplateLanguage = divert('themelet')
			.defaultTemplateLanguage;

		let templateLanguage =
			themeConfig.templateLanguage || defaultTemplateLanguage;

		let themeRootPath = '${theme_display.getPathThemeRoot()}';

		if (templateLanguage === 'vm') {
			themeRootPath = '$theme_display.getPathThemeRoot()';
		}

		gulp
			.src(
				path.join(
					pathBuild,
					'templates/portal_normal.' + templateLanguage
				)
			)
			.pipe(
				plugins.inject(sources, {
					endtag: '<!-- endinject -->',
					starttag: '<!-- inject:js -->',
					transform: function(filePath) {
						injected = true;

						let filePathArray = getThemeletFilePathArray(filePath);

						filePath = filePathArray.join(FORWARD_SLASH);

						return (
							'<script src="' +
							themeRootPath +
							FORWARD_SLASH +
							filePath +
							'"></script>'
						);
					},
				})
			)
			.pipe(gulp.dest(path.join(pathBuild, 'templates')))
			.on('end', function() {
				if (
					!injected &&
					themeletSources &&
					!_.isEmpty(themeConfig.themeletDependencies)
				) {
					let colors = gutil.colors;

					gutil.log(
						colors.yellow('Warning:'),
						'Failed to automatically inject themelet js. Make sure inject tags are present in',
						colors.magenta('portal_normal.' + templateLanguage)
					);
				}

				cb();
			});
	});

	gulp.task('build:themelet-src', function(cb) {
		runThemeletDependenciesSeries(function(item, index, done) {
			gulp
				.src(path.resolve(CWD, 'node_modules', index, 'src', '**', '*'))
				.pipe(gulp.dest(path.join(pathBuild, 'themelets', index)))
				.on('end', done);
		}, cb);
	});

	function runThemeletDependenciesSeries(asyncTask, cb) {
		let themeletStreamMap = _.map(getThemeletDependencies(), function(
			item,
			index
		) {
			return _.bind(asyncTask, this, item, index);
		});

		async.series(themeletStreamMap, cb);
	}
};

function getThemeletFilePathArray(filePath) {
	let filePathArray = path.join(filePath).split(path.sep);

	filePathArray = filePathArray.slice(
		filePathArray.indexOf('themelets'),
		filePathArray.length
	);

	return filePathArray;
}

function getThemeletDependencies() {
	let packageJSON = require(path.join(CWD, 'package.json'));

	let themeletDependencies;

	if (
		packageJSON.liferayTheme &&
		packageJSON.liferayTheme.themeletDependencies
	) {
		themeletDependencies = packageJSON.liferayTheme.themeletDependencies;
	}

	return themeletDependencies;
}
