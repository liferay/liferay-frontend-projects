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
			'build:prep-css',
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
		var sourceFiles = [path.join(themeUtil.resolveDependency(versionMap.getDependencyName('unstyled')), baseThemeGlob)];

		sourceFiles = getBaseThemeDependencies(process.cwd(), sourceFiles);

		return gulp.src(sourceFiles)
			.pipe(gulp.dest(pathBuild));
	});

	gulp.task('build:clean', function(cb) {
		del([pathBuild], cb);
	});

	gulp.task('build:compile-css', function(cb) {
		var changedFile = getSrcPathConfig().changedFile;

		// During watch task, exit task early if changed file is not css
		if (changedFile && changedFile.type == 'changed' && !themeUtil.isCssFile(changedFile.path)) {
			cb();

			return;
		}

		var compileTask = themeConfig.rubySass ? 'build:compile-ruby-sass' : 'build:compile-lib-sass';

		runSequence(compileTask, cb);
	});

	gulp.task('build:compile-lib-sass', function(cb) {
		var gulpSass = themeUtil.requireDependency('gulp-sass', themeConfig.version);

		var config = _.assign({
			includePaths: getSassInlcudePaths(themeConfig.version, themeConfig.rubySass),
			sourceMap: false
		}, options.sassOptions);

		var cssBuild = pathBuild + '/_css';

		var srcPath = themeUtil.getCssSrcPath(path.join(cssBuild, '!(_)*.scss'), getSrcPathConfig());

		gulp.src(srcPath)
			.pipe(plugins.plumber())
			.pipe(gulpSass(config))
			.pipe(gulp.dest(cssBuild))
			.on('end', cb);
	});

	gulp.task('build:compile-ruby-sass', function(cb) {
		var gulpRubySass = themeUtil.requireDependency('gulp-ruby-sass', themeConfig.version);

		var config = _.assign({
			compass: true,
			loadPath: getSassInlcudePaths(themeConfig.version, themeConfig.rubySass),
			sourcemap: false
		}, options.sassOptions);

		var cssBuild = pathBuild + '/_css';

		var srcPath = themeUtil.getCssSrcPath(path.join(cssBuild, '*.scss'), getSrcPathConfig());

		gulpRubySass(srcPath, config)
			.pipe(gulp.dest(cssBuild))
			.on('end', function() {
				if (renamedFiles && renamedFiles.length) {
					del(renamedFiles, cb);
				}
				else {
					cb();
				}
			});
	});

	gulp.task('build:fix-at-directives', function() {
		var keyframeRulesReplace = function(match, m1, m2) {
			return _.map(m1.split(','), function(item, index) {
				return item.replace(/.*?(from|to|[0-9\.]+%)/g, '$1');
			}).join(',') + m2;
		};

		return gulp.src(pathBuild + '/css/*.css')
			.pipe(replace({
				patterns: [
					{
						match: /(@font-face|@page|@-ms-viewport)\s*({\n\s*)(.*)\s*({)/g,
						replacement: function(match, m1, m2, m3, m4) {
							return m3 + m2 + m1 + ' ' + m4;
						}
					},
					{
						match: /(@-ms-keyframes.*{)([\s\S]+?)(}\s})/g,
						replacement: function(match, m1, m2, m3) {
							m2 = m2.replace(/(.+?)(\s?{)/g, keyframeRulesReplace);

							return m1 + m2 + m3;
						}
					}
				]
			}))
			.pipe(gulp.dest(pathBuild + '/css'));
	});

	// Temp fix for libSass compilation issue with empty url() functions
	gulp.task('build:fix-url-functions', function(cb) {
		if (!themeConfig.rubySass) {
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

	gulp.task('build:hook', function() {
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
		return gulp.src(path.join(pathSrc, '**/*'), {
				base: pathSrc
			})
			.pipe(gulp.dest(pathBuild));
	});

	gulp.task('build:web-inf', function() {
		return gulp.src(pathBuild + '/WEB-INF/src/**/*', {
				base: pathBuild + '/WEB-INF/src'
			})
			.pipe(gulp.dest(pathBuild + '/WEB-INF/classes'));
	});

	gulp.task('build:liferay-look-and-feel', function(cb) {
		var themePath = process.cwd();

		lookAndFeelUtil.mergeLookAndFeelJSON(themePath, {}, function(lookAndFeelJSON) {
			if (!lookAndFeelJSON) {
				return cb();
			}

			var themeName = lookAndFeelUtil.getNameFromPluginPackageProperties(themePath);

			lookAndFeelUtil.correctJSONIdentifiers(lookAndFeelJSON, themeName);

			var doctypeElement = lookAndFeelUtil.getLookAndFeelDoctype(themePath);

			if (!doctypeElement) {
				doctypeElement = lookAndFeelUtil.getLookAndFeelDoctypeByVersion(themeConfig.version);
			}

			var xml = lookAndFeelUtil.buildXML(lookAndFeelJSON, doctypeElement);

			fs.writeFile(path.join(themePath, pathBuild, 'WEB-INF/liferay-look-and-feel.xml'), xml, function(err) {
				cb();
			});
		});
	});

	gulp.task('build:prep-css', function(cb) {
		if (themeConfig.version == '6.2') {
			runSequence('build:rename-css-files', cb);
		}
		else {
			cb();
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
			.pipe(plugins.plumber())
			.pipe(r2())
			.pipe(gulp.dest(pathBuild + '/css'));
	});

	gulp.task('build:remove-old-css-dir', function(cb) {
		del([pathBuild + '/_css'], cb);
	});

	gulp.task('build:rename-css-dir', function(cb) {
		fs.rename(pathBuild + '/css', pathBuild + '/_css', cb);
	});

	gulp.task('build:rename-css-files', function(cb) {
		var cssBuild = pathBuild + '/_css';

		var vinylPaths = require('vinyl-paths');

		renamedFiles = [];

		var changeFile = store.get('changedFile');

		var base = changeFile ? pathSrc + '/css' : pathBuild + '/css';

		gulp.src(path.join(cssBuild, '**/*.css'), {
				base: base
			})
			.pipe(plugins.rename({
				extname: '.scss'
			}))
			.pipe(vinylPaths(function(path, done) {
				renamedFiles.push(path);

				done();
			}))
			.pipe(gulp.dest(cssBuild))
			.on('end', cb);
	});

	gulp.task('build:war', ['plugin:war']);

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
		dependencies.splice(1, 0, path.join(themeUtil.resolveDependency(versionMap.getDependencyName('styled')), baseThemeGlob));

		if (baseTheme == 'classic') {
			dependencies.splice(2, 0, path.join(themeUtil.resolveDependency(versionMap.getDependencyName('classic')), baseThemeGlob));
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

function getSassInlcudePaths(version, rubySass) {
	var includePaths = [
		themeUtil.resolveDependency(versionMap.getDependencyName('mixins'))
	];

	if (version != 6.2) {
		var createBourbonFile = require('../lib/bourbon_dependencies').createBourbonFile;

		includePaths = includePaths.concat(createBourbonFile());
	}

	if (!rubySass) {
		includePaths.push(path.dirname(require.resolve('compass-mixins')));
	}

	return includePaths;
}
