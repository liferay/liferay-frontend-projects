'use strict';

const del = require('del');
const plugins = require('gulp-load-plugins')();
const gutil = require('gulp-util');
const _ = require('lodash');
const path = require('path');

const {createBourbonFile} = require('../../lib/bourbon_dependencies');
const divert = require('../../lib/divert');
const lfrThemeConfig = require('../../lib/liferay_theme_config');
const themeUtil = require('../../lib/util');

const themeConfig = lfrThemeConfig.getConfig();

module.exports = function(options) {
	const {gulp, pathBuild} = options;
	const {storage} = gulp;

	const handleScssError = err => {
		if (options.watching) {
			gutil.log(err);

			this.emit('end');
		} else {
			throw err;
		}
	};
	const runSequence = require('run-sequence').use(gulp);

	gulp.task('build:compile-css', function(cb) {
		let changedFile = getSrcPathConfig(storage).changedFile;

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
			.on('end', cb);
	});
};

function concatBourbonIncludePaths(includePaths) {
	return includePaths.concat(createBourbonFile());
}

function getSassIncludePaths(rubySass) {
	let includePaths = [
		themeUtil.resolveDependency(
			divert('dependencies').getDependencyName('mixins')
		),
	];

	includePaths = concatBourbonIncludePaths(includePaths);

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

function getSrcPathConfig(storage) {
	return {
		changedFile: storage.get('changedFile'),
		deployed: storage.get('deployed'),
		version: themeConfig.version,
	};
}
