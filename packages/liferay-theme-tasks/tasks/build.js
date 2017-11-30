'use strict';

let _ = require('lodash');
let del = require('del');
let fs = require('fs-extra');
let gutil = require('gulp-util');
let path = require('path');
let plugins = require('gulp-load-plugins')();
let replace = require('gulp-replace-task');

let divert = require('../lib/divert');
let lfrThemeConfig = require('../lib/liferay_theme_config');
let lookAndFeelUtil = require('../lib/look_and_feel_util');
let themeUtil = require('../lib/util');

let STR_FTL = 'ftl';

let STR_VM = 'vm';

let themeConfig = lfrThemeConfig.getConfig();

let baseThemeGlob = getBaseThemeGlob(themeConfig.templateLanguage);

let renamedFiles;

module.exports = function(options) {
	let gulp = options.gulp;

	let store = gulp.storage;

	let pathBuild = options.pathBuild;
	let pathSrc = options.pathSrc;

	let runSequence = require('run-sequence').use(gulp);

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
		let sourceFiles = [
			path.join(
				themeUtil.resolveDependency(
					divert('dependencies').getDependencyName('unstyled')
				),
				baseThemeGlob
			),
		];

		sourceFiles = getBaseThemeDependencies(process.cwd(), sourceFiles);

		return gulp.src(sourceFiles).pipe(gulp.dest(pathBuild));
	});

	gulp.task('build:clean', function(cb) {
		del([pathBuild], cb);
	});

	gulp.task('build:compile-css', function(cb) {
		let changedFile = getSrcPathConfig().changedFile;

		// During watch task, exit task early if changed file is not css

		if (
			changedFile &&
			changedFile.type === 'changed' &&
			!themeUtil.isCssFile(changedFile.path)
		) {
			cb();

			return;
		}

		let compileTask = themeConfig.rubySass
			? 'build:compile-ruby-sass'
			: 'build:compile-lib-sass';

		runSequence(compileTask, cb);
	});

	gulp.task('build:compile-lib-sass', function(cb) {
		let gulpIf = require('gulp-if');
		let gulpSass = themeUtil.requireDependency(
			'gulp-sass',
			themeConfig.version
		);
		let gulpSourceMaps = require('gulp-sourcemaps');

		let sassOptions = getSassOptions(options.sassOptions, {
			includePaths: getSassIncludePaths(themeConfig.rubySass),
			sourceMap: false,
		});

		let cssBuild = pathBuild + '/_css';

		let srcPath = path.join(cssBuild, '!(_)*.scss');

		gulp
			.src(srcPath)
			.pipe(plugins.plumber())
			.pipe(gulpIf(sassOptions.sourceMap, gulpSourceMaps.init()))
			.pipe(gulpSass(sassOptions))
			.on('error', handleScssError)
			.pipe(gulpIf(sassOptions.sourceMap, gulpSourceMaps.write('.')))
			.pipe(gulp.dest(cssBuild))
			.on('end', cb);
	});

	gulp.task('build:compile-ruby-sass', function(cb) {
		let gulpIf = require('gulp-if');
		let gulpRubySass = themeUtil.requireDependency(
			'gulp-ruby-sass',
			themeConfig.version
		);
		let gulpSourceMaps = require('gulp-sourcemaps');

		let sassOptions = getSassOptions(options.sassOptions, {
			compass: true,
			loadPath: getSassIncludePaths(themeConfig.rubySass),
			sourcemap: false,
		});

		let cssBuild = pathBuild + '/_css';

		let srcPath = path.join(cssBuild, '*.scss');

		gulpRubySass(srcPath, sassOptions)
			.pipe(gulpIf(sassOptions.sourcemap, gulpSourceMaps.init()))
			.on('error', handleScssError)
			.pipe(gulpIf(sassOptions.sourcemap, gulpSourceMaps.write('.')))
			.pipe(gulp.dest(cssBuild))
			.on('end', function() {
				if (renamedFiles && renamedFiles.length) {
					del(renamedFiles, cb);
				} else {
					cb();
				}
			});
	});

	gulp.task('build:fix-at-directives', function() {
		let patterns = divert('build').getFixAtDirectivesPatterns();

		return gulp
			.src(pathBuild + '/css/*.css')
			.pipe(
				replace({
					patterns: patterns,
				})
			)
			.pipe(gulp.dest(pathBuild + '/css'));
	});

	// Temp fix for libSass compilation issue with empty url() functions

	gulp.task('build:fix-url-functions', function(cb) {
		if (themeConfig.rubySass) {
			cb();
		} else {
			gulp
				.src(pathBuild + '/_css/**/*.css')
				.pipe(
					replace({
						patterns: [
							{
								match: /url\(url\(\)/g,
								replacement: 'url()',
							},
						],
					})
				)
				.pipe(
					gulp.dest(pathBuild + '/_css', {
						overwrite: true,
					})
				)
				.on('end', cb);
		}
	});

	gulp.task('build:hook', function() {
		let languageProperties = themeUtil.getLanguageProperties(pathBuild);

		return gulp
			.src(path.join(pathBuild, 'WEB-INF/liferay-hook.xml'))
			.pipe(
				replace({
					patterns: [
						{
							match: /<language-properties>content\/Language\*\.properties<\/language-properties>/,
							replacement: function() {
								let retVal = '';

								if (languageProperties) {
									retVal = languageProperties.join('\n\t');
								}

								return retVal;
							},
						},
					],
				})
			)
			.pipe(plugins.rename('liferay-hook.xml.processed'))
			.pipe(gulp.dest(path.join(pathBuild, 'WEB-INF')));
	});

	gulp.task('build:src', function() {
		return gulp
			.src(path.join(pathSrc, '**/*'), {
				base: pathSrc,
			})
			.pipe(gulp.dest(pathBuild));
	});

	gulp.task('build:web-inf', function() {
		return gulp
			.src(pathBuild + '/WEB-INF/src/**/*', {
				base: pathBuild + '/WEB-INF/src',
			})
			.pipe(gulp.dest(pathBuild + '/WEB-INF/classes'));
	});

	gulp.task('build:liferay-look-and-feel', function(cb) {
		let themePath = process.cwd();

		lookAndFeelUtil.mergeLookAndFeelJSON(themePath, {}, function(
			lookAndFeelJSON
		) {
			if (!lookAndFeelJSON) {
				return cb();
			}

			let themeName = lookAndFeelUtil.getNameFromPluginPackageProperties(
				themePath
			);

			lookAndFeelUtil.correctJSONIdentifiers(lookAndFeelJSON, themeName);

			let doctypeElement = lookAndFeelUtil.getLookAndFeelDoctype(
				themePath
			);

			if (!doctypeElement) {
				doctypeElement = lookAndFeelUtil.getLookAndFeelDoctypeByVersion(
					themeConfig.version
				);
			}

			let xml = lookAndFeelUtil.buildXML(lookAndFeelJSON, doctypeElement);

			fs.writeFile(
				path.join(
					themePath,
					pathBuild,
					'WEB-INF/liferay-look-and-feel.xml'
				),
				xml,
				function(err) {
					if (err) {
						throw err;
					}

					cb();
				}
			);
		});
	});

	gulp.task('build:prep-css', done =>
		divert('build').taskPrepCss(gulp, done)
	);

	gulp.task('build:move-compiled-css', function() {
		return gulp
			.src(pathBuild + '/_css/**/*')
			.pipe(gulp.dest(pathBuild + '/css'));
	});

	gulp.task('build:r2', function() {
		let r2 = require('gulp-liferay-r2-css');

		return gulp
			.src(pathBuild + '/css/*.css')
			.pipe(
				plugins.rename({
					suffix: '_rtl',
				})
			)
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
		let cssBuild = pathBuild + '/_css';

		let vinylPaths = require('vinyl-paths');

		renamedFiles = [];

		let changeFile = store.get('changedFile');

		let base = changeFile ? pathSrc + '/css' : pathBuild + '/css';

		gulp
			.src(path.join(cssBuild, '**/*.css'), {
				base: base,
			})
			.pipe(
				plugins.rename({
					extname: '.scss',
				})
			)
			.pipe(
				vinylPaths(function(path, done) {
					renamedFiles.push(path);

					done();
				})
			)
			.pipe(gulp.dest(cssBuild))
			.on('end', cb);
	});

	gulp.task('build:war', done => divert('build').taskWar(gulp, done));

	function getSrcPathConfig() {
		return {
			changedFile: store.get('changedFile'),
			deployed: store.get('deployed'),
			version: themeConfig.version,
		};
	}

	function handleScssError(err) {
		if (options.watching) {
			gutil.log(err);

			this.emit('end');
		} else {
			throw err;
		}
	}
};

function getBaseThemeDependencies(baseThemePath, dependencies) {
	let baseThemeInfo = getLiferayThemeJSON(baseThemePath);

	let baseTheme = baseThemeInfo.baseTheme;

	if (_.isObject(baseTheme)) {
		baseThemePath = path.join(
			baseThemePath,
			'node_modules',
			baseTheme.name
		);

		dependencies.push(path.resolve(baseThemePath, 'src/**/*'));

		return getBaseThemeDependencies(baseThemePath, dependencies);
	} else if (baseTheme === 'styled' || baseTheme === 'classic') {
		dependencies.splice(
			1,
			0,
			path.join(
				themeUtil.resolveDependency(
					divert('dependencies').getDependencyName('styled')
				),
				baseThemeGlob
			)
		);

		if (baseTheme === 'classic') {
			dependencies.splice(
				2,
				0,
				path.join(
					themeUtil.resolveDependency(
						divert('dependencies').getDependencyName('classic')
					),
					baseThemeGlob
				)
			);
		}

		return dependencies;
	}

	return dependencies;
}

function getBaseThemeGlob(templateLanguage) {
	let glob = '**/!(package.json';

	if (templateLanguage === STR_FTL) {
		templateLanguage = STR_VM;
	} else if (templateLanguage === STR_VM) {
		templateLanguage = STR_FTL;
	} else {
		return glob + ')';
	}

	return glob + '|*.' + templateLanguage + ')';
}

function getLiferayThemeJSON(themePath) {
	return require(path.join(themePath, 'package.json')).liferayTheme;
}

function getSassIncludePaths(rubySass) {
	let includePaths = [
		themeUtil.resolveDependency(
			divert('dependencies').getDependencyName('mixins')
		),
	];

	includePaths = divert('build').concatBourbonIncludePaths(includePaths);

	if (!rubySass) {
		includePaths.push(path.dirname(require.resolve('compass-mixins')));
	}

	return includePaths;
}

function getSassOptions(sassOptions, defaults) {
	if (_.isFunction(sassOptions)) {
		sassOptions = sassOptions(defaults);
	} else {
		sassOptions = _.assign(defaults, sassOptions);
	}

	return sassOptions;
}
