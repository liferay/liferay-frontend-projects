'use strict';

var _ = require('lodash');
var del = require('del');
var fs = require('fs-extra');
var glob = require('glob');
var gulpif = require('gulp-if');
var lfrThemeConfig = require('../lib/liferay_theme_config');
var lookAndFeelUtil = require('../lib/look_and_feel_util');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var replace = require('gulp-replace-task');
var themeUtil = require('../lib/util');
var versionMap = require('../lib/version_map');
var xml2js = require('xml2js');

var STR_FTL = 'ftl';

var STR_VM = 'vm';

var themeConfig = lfrThemeConfig.getConfig();

var baseThemeGlob = getBaseThemeGlob(themeConfig.templateLanguage);

var renamedFiles;

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	var pathBuild = options.pathBuild;
	var pathSrc = options.pathSrc;

	var runSequence = require('run-sequence').use(gulp);

	gulp.task('build', function(cb) {
		runSequence(
			'build:clean',
			'build:base',
			'build:src',
			'build:web-inf',
			'build:liferay-look-and-feel',
			'build:hook',
			'build:themelets',
			'build:rename-css-dir',
			'build:compile-css',
			'build:fix-url-functions',
			'build:move-compiled-css',
			'build:remove-old-css-dir',
			'build:fix-at-directives',
			'build:r2',
			'build:war',
			cb
		);
	});

	gulp.task('build:base', function() {
		var sourceFiles = [path.resolve(__dirname, '../node_modules', versionMap.getDependencyName('unstyled'), baseThemeGlob)];

		sourceFiles = getBaseThemeDependencies(process.cwd(), sourceFiles);

		return gulp.src(sourceFiles)
			.pipe(gulp.dest(pathBuild));
	});

	gulp.task('build:clean', function(cb) {
		del([pathBuild], cb);
	});

	gulp.task('build:fix-at-directives', function() {
		return gulp.src(pathBuild + '/css/*.css')
			.pipe(replace({
				patterns: [
					{
						match: /(@font-face|@page|@-ms-viewport)\s*({\n\s*)(.*)\s*({)/g,
						replacement: function(match, m1, m2, m3, m4) {
							return m3 + m2 + m1 + ' ' + m4;
						}
					}
				]
			}))
			.pipe(gulp.dest(pathBuild + '/css'));
	});

	// Temp fix for libSass compilation issue with empty url() functions
	gulp.task('build:fix-url-functions', function(cb) {
		if (!themeConfig.supportCompass) {
			return gulp.src(pathBuild + '/_css/**/*.css')
				.pipe(replace({
					patterns: [
						{
							match: /url\(url\(\)/g,
							replacement: 'url()'
						}
					]
				}))
				.pipe(gulp.dest(pathBuild + '/_css', {
					overwrite: true
				}));
		}
		else {
			cb();
		}
	});

	gulp.task('build:hook', function(cb) {
		var languageProperties = themeUtil.getLanguageProperties(pathBuild);

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
		var srcPathConfig = getSrcPathConfig();

		srcPathConfig.cssExtChanged = false;
		srcPathConfig.returnAllCSS = true;

		return gulp.src(themeUtil.getSrcPath(path.join(pathSrc, '**/*'), srcPathConfig), {
				base: pathSrc
			})
			.pipe(gulp.dest(pathBuild));
	});

	gulp.task('build:web-inf', function() {
		var changeFile = store.get('changedFile');

		var base = changeFile ? pathSrc + '/WEB-INF/src' : pathBuild + '/WEB-INF/src';

		return gulp.src(themeUtil.getSrcPath(pathBuild + '/WEB-INF/src/**/*', getSrcPathConfig()), {
				base: base
			})
			.pipe(gulp.dest(pathBuild + '/WEB-INF/classes'));
	});

	gulp.task('build:liferay-look-and-feel', function(cb) {
		lookAndFeelUtil.mergeLookAndFeelJSON(process.cwd(), {}, function(lookAndFeelJSON) {
			if (!lookAndFeelJSON) {
				return cb();
			}

			var builder = new xml2js.Builder({
				renderOpts: {
					indent: '\t',
					pretty: true
				}
			});

			var xml = builder.buildObject(lookAndFeelJSON);

			var doctypeElement = lookAndFeelUtil.getLookAndFeelDoctype(process.cwd());

			xml = lookAndFeelUtil.generateLookAndFeelXML(xml, doctypeElement);

			fs.writeFile(path.join(process.cwd(), pathBuild, 'WEB-INF/liferay-look-and-feel.xml'), xml, function(err) {
				cb();
			});
		});
	});

	gulp.task('build:compile-css', function(cb) {
		var supportCompass = themeConfig.supportCompass;

		var config = getSassConfig(supportCompass);

		var cssPreprocessor = config.cssPreprocessor || require('gulp-sass');

		var fileExt = config.fileExt || '.scss';

		config = _.omit(config, ['cssPreprocessor', 'fileExt']);

		var cssBuild = pathBuild + '/_css';

		var srcPathConfig = getSrcPathConfig();

		var changedFile = srcPathConfig.changedFile;

		// During watch task, exit task early if changed file is not css
		if (changedFile && changedFile.type == 'changed' && !themeUtil.isCssFile(changedFile.path)) {
			cb();

			return;
		}

		var srcPaths = path.join(cssBuild, '!(_)*' + fileExt);

		if (supportCompass) {
			runSequence('build:rename-css-files', function() {
				if (srcPathConfig.version == '6.2') {
					srcPaths = themeUtil.getSrcPath(path.join(cssBuild, '**/*.scss'), srcPathConfig);
				}

				cssPreprocessor(srcPaths, {
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

	gulp.task('build:r2', function() {
		var r2 = require('gulp-liferay-r2-css');

		return gulp.src(pathBuild + '/css/*.css')
			.pipe(plugins.rename({
				suffix: '_rtl'
			}))
			.pipe(r2())
			.pipe(gulp.dest(pathBuild + '/css'));
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

		var changeFile = store.get('changedFile');

		var base = changeFile ? pathSrc + '/css' : pathBuild + '/css';

		return gulp.src(themeUtil.getSrcPath(cssBuild + '/**/*.css', getSrcPathConfig(), function(name) {
				_.endsWith(name, '.css');
			}), {
				base: base
			})
			.pipe(plugins.rename({
				extname: '.scss'
			}))
			.pipe(vinylPaths(function(path, cb) {
				renamedFiles.push(path);

				cb();
			}))
			.pipe(gulp.dest(cssBuild));
	});

	gulp.task('build:war', function() {
		var themeName = lfrThemeConfig.getConfig(true).name;

		return gulp.src(pathBuild + '/**/*')
			.pipe(plugins.zip(themeName + '.war'))
			.pipe(gulp.dest(options.pathDist));
	});

	function getSrcPathConfig() {
		return {
			changedFile: store.get('changedFile'),
			deployed: store.get('deployed'),
			version: themeConfig.version
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
	else if (baseTheme == 'styled' || baseTheme == 'classic') {
		dependencies.splice(1, 0, path.resolve(__dirname, '../node_modules', versionMap.getDependencyName('styled'), baseThemeGlob));

		if (baseTheme == 'classic') {
			dependencies.splice(2, 0, path.resolve(__dirname, '../node_modules', versionMap.getDependencyName('classic'), baseThemeGlob));
		}

		return dependencies;
	}

	return dependencies;
}

function getBaseThemeGlob(templateLanguage) {
	var glob = '**/!(package.json';

	if (templateLanguage == STR_FTL) {
		templateLanguage = STR_VM;
	}
	else if (templateLanguage == STR_VM) {
		templateLanguage = STR_FTL;
	}
	else {
		return glob + ')';
	}

	return glob + '|*.' + templateLanguage + ')';
}

function getLiferayThemeJSON(themePath) {
	return require(path.join(themePath, 'package.json')).liferayTheme;
}

function getSassConfig(supportCompass) {
	var cssPrecompilerConfig = hasCustomSassConfig();

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

	if (themeConfig.version > 6.2) {
		var createBourbonFile = require('../lib/bourbon_dependencies').createBourbonFile;

		includePaths = includePaths.concat(createBourbonFile());
	}

	if (supportCompass) {
		config.cssPreprocessor = require('gulp-ruby-sass');
		config.loadPath = includePaths;
	}
	else {
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