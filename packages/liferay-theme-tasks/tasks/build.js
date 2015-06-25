'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var CheckSourceFormattingCLI = require('../node_modules/check-source-formatting/lib/cli').constructor;
var del = require('del');
var fs = require('fs-extra');
var glob = require('glob');
var gulpif = require('gulp-if');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var themeUtil = require('../lib/util');

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	var fullDeploy = (argv.full || argv.f);

	var pathBuild = options.pathBuild;

	var runSequence = require('run-sequence').use(gulp);

	gulp.task(
		'build',
		function(cb) {
			runSequence(
				'build:clean',
				'build:base',
				'build:src',
				'build:web-inf',
				'build:hook',
				'build:themelets',
				'rename-css-dir',
				'compile-scss',
				'move-compiled-css',
				'remove-old-css-dir',
				'build:war',
				cb
			);
		}
	);

	gulp.task(
		'build:base',
		function() {
			var sourceFiles = [path.resolve(__dirname, '../node_modules/liferay-theme-unstyled/src/**/*')];

			if (store.get('baseTheme') == 'styled') {
				sourceFiles.push(path.resolve(__dirname, '../node_modules/liferay-theme-styled/src/**/*'));
			}

			var baseThemeName = store.get('baseThemeName');

			if (!_.isUndefined(baseThemeName)) {
				sourceFiles.push(path.resolve(process.cwd(), 'node_modules',  baseThemeName, 'src/**/*'));
			}

			return gulp.src(sourceFiles)
				// .pipe(plugins.debug())
				.pipe(gulp.dest(pathBuild));
		}
	);

	gulp.task(
		'build:clean',
		function(cb) {
			del([pathBuild], cb);
		}
	);

	gulp.task(
		'build:hook',
		function(cb) {
			var languageProperties = themeUtil.getLanguageProperties();

			if (languageProperties.length) {
				fs.readFile(
					path.join(pathBuild, 'WEB-INF/liferay-hook.xml'),
					{
						encoding: 'utf8'
					},
					function(err, data) {
						if (err) {
							cb();
						}

						var match = /<language-properties>content\/Language\*\.properties<\/language-properties>/;

						if (data.match(match)) {
							data = data.replace(match, languageProperties.join('\n\t'));

							fs.writeFileSync(path.join(pathBuild, 'WEB-INF/liferay-hook.xml.processed'), data);
						}

						cb();
					}
				);
			}
			else {
				cb();
			}
		}
	);

	gulp.task(
		'build:src',
		function() {
			return gulp.src(themeUtil.getSrcPath(path.join(options.pathSrc, '**/*')))
				// .pipe(plugins.debug())
				.pipe(gulp.dest(pathBuild));
		}
	);

	gulp.task(
		'build:web-inf',
		function() {
			return gulp.src(themeUtil.getSrcPath('./build/WEB-INF/src/**/*'))
				// .pipe(plugins.debug())
				.pipe(gulp.dest('./build/WEB-INF/classes'));
		}
	);

	gulp.task(
		'check_sf',
		function(cb) {
			glob(
			'src/**/*?(.css|.ftl|.js|.jsp|.scss|.vm)',
				function(err, files) {
					if (err) throw err;

					var checkSF = new CheckSourceFormattingCLI(
						{
							args: files
						}
					);

					checkSF.init();
				}
			);
		}
	);

	gulp.task(
		'compile-scss',
		function() {
			var supportCompass = options.supportCompass;

			var config = getSassConfig(supportCompass);

			var sass = supportCompass ? plugins.rubySass : plugins.sass;

			var cssBuild = pathBuild + '/_css';

			return gulp.src(themeUtil.getSrcPath(cssBuild + '/**/*.+(css|scss)', themeUtil.isCssFile))
				.pipe(gulpif(supportCompass, plugins.rename(
					{
						extname: '.scss'
					}
				)))
				.pipe(plugins.plumber())
				.pipe(sass(config))
				// .pipe(plugins.debug())
				// .pipe(plugins.plumber.stop())
				.pipe(gulp.dest(cssBuild));
		}
	);

	gulp.task(
		'move-compiled-css',
		function(cb) {
			return gulp.src(pathBuild + '/_css/**/*')
				.pipe(gulp.dest(pathBuild + '/css'))
		}
	);

	gulp.task(
		'build:war',
		function() {
			var themeName = store.get('themeName');

			return gulp.src(pathBuild + '/**/*')
				.pipe(
					plugins.war(
						{
							displayName: themeName
						}
					)
				)
				.pipe(plugins.zip(themeName + '.war'))
				.pipe(gulp.dest('./dist'));
		}
	);

	gulp.task(
		'remove-old-css-dir',
		function(cb) {
			del([pathBuild + '/_css'], cb);
		}
	);

	gulp.task(
		'rename-css-dir',
		function(cb) {
			fs.rename(
				pathBuild + '/css',
				pathBuild + '/_css',
				cb
			);
		}
	);
}

function getSassConfig(supportCompass) {
	var config = {
		sourceMap: false
	};

	var includePaths = [
		path.resolve(__dirname, '../node_modules/liferay-theme-mixins/src'),
		path.resolve(__dirname, '../node_modules/liferay-theme-mixins/src/liferay')
	];

	if (supportCompass) {
		config.compass = true;
		config.loadPath = includePaths;
	}
	else {
		var bourbon = require('node-bourbon');

		includePaths = includePaths.concat(bourbon.includePaths);

		config.includePaths = includePaths;
	}

	return config;
}