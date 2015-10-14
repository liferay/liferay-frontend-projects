'use strict';

var _ = require('lodash');
var CheckSourceFormattingCLI = require('../node_modules/check-source-formatting/lib/cli').constructor;
var del = require('del');
var fs = require('fs-extra');
var glob = require('glob');
var gulpif = require('gulp-if');
var lfrThemeConfig = require('../lib/liferay_theme_config');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var replace = require('gulp-replace-task');
var themeUtil = require('../lib/util');
var versionMap = require('../lib/version_map');

var renamedFiles;

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	var pathBuild = options.pathBuild;

	var runSequence = require('run-sequence').use(gulp);

	gulp.task('build', function(cb) {
		runSequence(
			'build:clean',
			'build:base',
			'build:src',
			'build:web-inf',
			'build:hook',
			'build:themelets',
			'build:rename-css-dir',
			'build:compile-css',
			'build:move-compiled-css',
			'build:remove-old-css-dir',
			'build:war',
			cb
		);
	});

	gulp.task('build:base', function() {
		var sourceFiles = [path.resolve(__dirname, '../node_modules', versionMap.getDependencyName('unstyled'), '**/!(package.json)')];

		sourceFiles = getBaseThemeDependencies(process.cwd(), sourceFiles);

		return gulp.src(sourceFiles)
			.pipe(gulp.dest(pathBuild));
	});

	gulp.task('build:clean', function(cb) {
		del([pathBuild], cb);
	});

	gulp.task('build:hook', function(cb) {
		var languageProperties = themeUtil.getLanguageProperties();

		return gulp.src(path.join(pathBuild, 'WEB-INF/liferay-hook.xml'))
			.pipe(replace({
				patterns: [
					{
						match: /<language-properties>content\/Language\*\.properties<\/language-properties>/,
						replacement: function(match) {
							var retVal = '';

							if (languageProperties) {
								retVal = languageProperties.join('\n\t');
							}

							return retVal;
						}
					}
				]
			}))
			.pipe(plugins.rename('liferay-hook.xml.processed'))
			.pipe(gulp.dest(path.join(pathBuild, 'WEB-INF')));
	});

	gulp.task('build:src', function() {
		return gulp.src(themeUtil.getSrcPath(path.join(options.pathSrc, '**/*'), getSrcPathConfig()))
			.pipe(gulp.dest(pathBuild));
	});

	gulp.task('build:web-inf', function() {
		return gulp.src(themeUtil.getSrcPath('./build/WEB-INF/src/**/*', getSrcPathConfig()))
			.pipe(gulp.dest('./build/WEB-INF/classes'));
	});

	gulp.task('check_sf', function(cb) {
		glob('src/**/*?(.css|.ftl|.js|.jsp|.scss|.vm)', function(err, files) {
			if (err) throw err;

			var checkSF = new CheckSourceFormattingCLI({
				args: files
			});

			checkSF.init();
		});
	});

	gulp.task('build:compile-css', function(cb) {
		var themeConfig = lfrThemeConfig.getConfig();

		var supportCompass = themeConfig.supportCompass;

		var config = getSassConfig(supportCompass);

		var cssPreprocessor = config.cssPreprocessor || require('gulp-sass');

		var fileExt = config.fileExt || '.scss';

		config = _.omit(config, ['cssPreprocessor', 'fileExt']);

		var cssBuild = pathBuild + '/_css';

		if (supportCompass) {
			runSequence('build:rename-css-files', function() {
				cssPreprocessor(path.join(cssBuild, '**/*.scss'), {
						compass: true,
						loadPath: config.loadPath
					})
					.pipe(gulp.dest(cssBuild))
					.on('end', function() {
						del(renamedFiles, cb);
					});
			});
		}
		else {
			var srcPaths = path.join(cssBuild, '!(_)*' + fileExt);

			return gulp.src(srcPaths)
				.pipe(plugins.plumber())
				.pipe(cssPreprocessor(config))
				.pipe(gulp.dest(cssBuild));
		}
	});

	gulp.task('build:move-compiled-css', function() {
		return gulp.src(pathBuild + '/_css/**/*')
			.pipe(gulp.dest(pathBuild + '/css'));
	});

	gulp.task('build:war', function() {
		var themeName = lfrThemeConfig.getConfig(true).name;

		return gulp.src(pathBuild + '/**/*')
			.pipe(plugins.war({
				displayName: themeName
			}))
			.pipe(plugins.zip(themeName + '.war'))
			.pipe(gulp.dest('./dist'));
	});

	gulp.task('build:remove-old-css-dir', function(cb) {
		del([pathBuild + '/_css'], cb);
	});

	gulp.task('build:rename-css-dir', function(cb) {
		fs.rename(pathBuild + '/css', pathBuild + '/_css', cb);
	});

	gulp.task('build:rename-css-files', function() {
		var cssBuild = pathBuild + '/_css';

		var vinylPaths = require('vinyl-paths');

		renamedFiles = [];

		return gulp.src(themeUtil.getSrcPath(cssBuild + '/**/*.css', getSrcPathConfig(), themeUtil.isCssFile))
			.pipe(plugins.rename({
				extname: '.scss'
			}))
			.pipe(plugins.debug())
			.pipe(vinylPaths(function(path) {
				renamedFiles.push(path);

				return Promise.resolve();
			}))
			.pipe(gulp.dest(cssBuild));
	});

	function getSrcPathConfig() {
		return {
			changedFile: store.get('changedFile'),
			deployed: store.get('deployed')
		};
	}
};

function getBaseThemeDependencies(baseThemePath, dependencies) {
	var baseThemeInfo = getLiferayThemeJSON(baseThemePath);

	var baseTheme = baseThemeInfo.baseTheme;

	if (_.isObject(baseTheme)) {
		baseThemePath = path.join(baseThemePath, 'node_modules', baseTheme.name);

		dependencies.push(path.resolve(baseThemePath, 'src/**/*'));

		return getBaseThemeDependencies(baseThemePath, dependencies);
	}
	else if (baseTheme == 'styled') {
		dependencies.splice(1, 0, path.resolve(__dirname, '../node_modules', versionMap.getDependencyName('styled'), '**/!(package.json)'));

		return dependencies;
	}

	return dependencies;
}

function getLiferayThemeJSON(themePath) {
	return require(path.join(themePath, 'package.json')).liferayTheme;
}

function getSassConfig(supportCompass) {
	var cssPrecompilerConfig = hasCustomSassConfig();

	var themeConfig = lfrThemeConfig.getConfig();

	if (cssPrecompilerConfig) {
		if (themeConfig.baseTheme != 'unstyled') {
			var util = plugins.util;

			util.log(util.colors.yellow(
				'Warning! If you are using a css preprocessor other than sass, you must extend from the Unstyled theme. Run',
				util.colors.cyan('gulp extend'),
				'to change configuration.')
			);
		}

		return require(cssPrecompilerConfig)();
	}
	else {
		return getSassConfigDefaults(themeConfig.supportCompass);
	}
}

function getSassConfigDefaults(supportCompass) {
	var config = {
		sourceMap: false
	};

	var includePaths = [
		path.resolve(__dirname, '../node_modules', versionMap.getDependencyName('mixins'))
	];

	if (supportCompass) {
		config.cssPreprocessor = require('gulp-ruby-sass');
		config.loadPath = includePaths;
	}
	else {
		var createBourbonFile = require('../lib/bourbon_dependencies').createBourbonFile;

		includePaths = includePaths.concat(createBourbonFile());

		config.cssPreprocessor = require('gulp-sass');
		config.includePaths = includePaths;
	}

	return config;
}

function hasCustomSassConfig() {
	try {
		return require.resolve(path.join(process.cwd(), 'css_precompiler.js'));
	}
	catch(e) {
		return false;
	}
}