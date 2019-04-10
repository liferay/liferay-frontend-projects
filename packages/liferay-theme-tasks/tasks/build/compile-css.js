/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const colors = require('ansi-colors');
const fs = require('fs');
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
		const gulpIf = require('gulp-if');
		const gulpSass = require('gulp-sass');
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
		(themeConfig.hasOwnProperty('postcss') && 'package.json "postcss"') ||
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

	if (_.isArray(config) && config.length > 0) {
		if (rc) {
			throw new Error(
				'PostCSS must be configured in only one place but it was ' +
					'configured in both "liferayTheme" properties of the ' +
					`package.json and also in ${rc}`
			);
		}

		postCSSOptions.enabled = true;

		postCSSOptions.plugins = config.map(pluginDependency =>
			require(pluginDependency)
		);
	} else if (rc) {
		postCSSOptions.enabled = true;
	}

	return postCSSOptions;
}

function getSassIncludePaths() {
	let includePaths = [
		themeUtil.getCustomDependencyPath('liferay-frontend-common-css') ||
			path.dirname(require.resolve('liferay-frontend-common-css')),
	];

	includePaths = concatBourbonIncludePaths(includePaths);
	includePaths.push(path.dirname(require.resolve('compass-mixins')));

	const argv = themeUtil.getArgv();
	if (argv['sass-include-paths']) {
		const customPaths = argv['sass-include-paths']
			.split(',')
			.map(item => path.resolve(item));
		log(
			'using custom SASS include paths:',
			colors.magenta(customPaths.join(', '))
		);
		includePaths.push(...customPaths);
	}

	const themeNodeModules = path.resolve('node_modules');
	if (fs.existsSync(themeNodeModules)) {
		includePaths.push(themeNodeModules);
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
	const themeConfig = lfrThemeConfig.getConfig();

	return {
		changedFile: storage.get('changedFile'),
		deployed: storage.get('deployed'),
		version: themeConfig.version,
	};
}
