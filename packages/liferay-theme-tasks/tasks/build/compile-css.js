/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const _ = require('lodash');
const path = require('path');
const log = require('fancy-log');
const postcss = require('gulp-postcss');

const {createBourbonFile} = require('../../lib/bourbon_dependencies');
const lfrThemeConfig = require('../../lib/liferay_theme_config');
const themeUtil = require('../../lib/util');

module.exports = function(options) {
	const {gulp, pathBuild} = options;
	const {storage} = gulp;

	const handleScssError = err => {
		if (options.watching) {
			log(err);

			this.emit('end');
		} else {
			throw err;
		}
	};
	const runSequence = require('run-sequence').use(gulp);

	gulp.task('build:compile-css', function(cb) {
		const changedFile = getSrcPathConfig(storage).changedFile;

		// During watch task, exit task early if changed file is not css

		if (
			changedFile &&
			changedFile.type === 'changed' &&
			!themeUtil.isCssFile(changedFile.path)
		) {
			cb();

			return;
		}

		const compileTask = 'build:compile-lib-sass';

		runSequence(compileTask, cb);
	});

	gulp.task('build:compile-lib-sass', function(cb) {
		const themeConfig = lfrThemeConfig.getConfig();

		const gulpIf = require('gulp-if');
		const gulpSass = themeUtil.requireDependency(
			'gulp-sass',
			themeConfig.version
		);
		const gulpSourceMaps = require('gulp-sourcemaps');

		const sassOptions = getSassOptions(options.sassOptions, {
			includePaths: getSassIncludePaths(),
			sourceMap: true,
		});

		const postCSSOptions = getPostCSSOptions(options.postcss);

		const cssBuild = pathBuild + '/_css';

		const srcPath = path.join(cssBuild, '!(_)*.scss');

		gulp.src(srcPath)
			.pipe(gulpIf(sassOptions.sourceMap, gulpSourceMaps.init()))
			.pipe(gulpSass(sassOptions))
			.pipe(
				gulpIf(postCSSOptions.enabled, postcss(postCSSOptions.plugins))
			)
			.on('error', handleScssError)
			.pipe(gulpIf(sassOptions.sourceMap, gulpSourceMaps.write('.')))
			.pipe(gulp.dest(cssBuild))
			.on('end', cb);
	});
};

function concatBourbonIncludePaths(includePaths) {
	return includePaths.concat(createBourbonFile());
}

function getPostCSSOptions(config) {
	const postCSSOptions = {
		enabled: false,
	};

	// We bundle autoprefixer automatically, so do not try to resolve it to the theme

	if (_.isArray(config) && config.length > 0) {
		postCSSOptions.enabled = true;
		postCSSOptions.plugins = config
			.map(pluginName =>
				pluginName === 'autoprefixer'
					? pluginName
					: themeUtil.resolveDependency(pluginName)
			)
			.map(pluginDependency => require(pluginDependency));
	}

	return postCSSOptions;
}

function getSassIncludePaths() {
	let includePaths = [
		themeUtil.resolveDependency('liferay-frontend-common-css'),
	];

	includePaths = concatBourbonIncludePaths(includePaths);
	includePaths.push(path.dirname(require.resolve('compass-mixins')));

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
	const themeConfig = lfrThemeConfig.getConfig();

	return {
		changedFile: storage.get('changedFile'),
		deployed: storage.get('deployed'),
		version: themeConfig.version,
	};
}
