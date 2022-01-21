/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const log = require('fancy-log');
const fs = require('fs');
const postcss = require('gulp-postcss');
const _ = require('lodash');
const path = require('path');

const {createBourbonFile} = require('../../lib/bourbon_dependencies');
const lfrThemeConfig = require('../../lib/liferay_theme_config');
const themeUtil = require('../../lib/util');

module.exports = function (options) {
	const {gulp, pathBuild} = options;

	const handleScssError = (err) => {
		if (options.watching) {
			log(err);

			this.emit('end');
		}
		else {
			throw err;
		}
	};
	const runSequence = require('run-sequence').use(gulp);

	gulp.task('build:compile-css', (cb) => {

		// For backwards compatibility we keep this task around, but all it does
		// is call through to the one that does the actual work:

		runSequence('build:compile-lib-sass', cb);
	});

	gulp.task('build:compile-lib-sass', (cb) => {
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

/**
 * Returns the string `file` if a file with that name exists, and
 * `false` otherwise.
 *
 * Example:
 *
 *     > exists('package.json')
 *     'package.json'
 */
function exists(file) {
	return fs.existsSync(file) && file;
}

/**
 * Returns a string indicating which of the standard methods for
 * configuring PostCSS applies to the current theme, if any. Otherwise,
 * returns `false`.
 */
function getPostCSSRC() {
	const themeConfig = lfrThemeConfig.getConfig(true);

	return (
		(Object.prototype.hasOwnProperty.call(themeConfig, 'postcss') &&
			'package.json "postcss"') ||
		exists('.postcssrc') ||
		exists('.postcssrc.js') ||
		exists('.postcssrc.json') ||
		exists('.postcssrc.yml') ||
		exists('postcss.config.js')
	);
}

function getPostCSSOptions(config) {
	const postCSSOptions = {
		enabled: false,
	};

	const rc = getPostCSSRC();

	if (_.isArray(config) && !!config.length) {
		if (rc) {
			throw new Error(
				'PostCSS must be configured in only one place but it was ' +
					'configured in both "liferayTheme" properties of the ' +
					`package.json and also in ${rc}`
			);
		}

		postCSSOptions.enabled = true;

		postCSSOptions.plugins = config.map((pluginDependency) =>
			// eslint-disable-next-line @liferay/no-dynamic-require
			require(pluginDependency)
		);
	}
	else if (rc) {
		postCSSOptions.enabled = true;
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
	}
	else {
		sassOptions = _.assign(defaults, sassOptions);
	}

	return sassOptions;
}
