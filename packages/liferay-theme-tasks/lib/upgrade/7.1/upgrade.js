/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const replace = require('gulp-replace-task');
const spawn = require('cross-spawn');

const devDependencies = require('../../devDependencies');
const lfrThemeConfig = require('../../liferay_theme_config');

module.exports = function(options) {
	const gulp = options.gulp;

	const runSequence = require('run-sequence').use(gulp);

	gulp.task('upgrade:dependencies', function(cb) {
		lfrThemeConfig.removeDependencies(['liferay-theme-deps-7.1']);
		lfrThemeConfig.setDependencies(devDependencies, true);

		const npmInstall = spawn('npm', ['install']);

		npmInstall.stderr.pipe(process.stderr);
		npmInstall.stdout.pipe(process.stdout);

		npmInstall.on('close', cb);
	});

	gulp.task('upgrade:config', function() {
		const lfrThemeConfig = require('../../liferay_theme_config.js');

		lfrThemeConfig.setConfig({
			version: '7.2',
		});

		return gulp
			.src(
				'src/WEB-INF/+(liferay-plugin-package.properties|liferay-look-and-feel.xml)'
			)
			.pipe(
				replace({
					patterns: [
						{
							match: /(DTD Look and Feel )\d(?:\.\d+)+(\/\/EN)/g,
							replacement: '$17.2.0$2',
						},
						{
							match: /(liferay-look-and-feel_)\d(?:_\d+)+(\.dtd)/g,
							replacement: '$17_2_0$2',
						},
						{
							match: /(<version>).+(<\/version>)/g,
							replacement: '$17.2.0+$2',
						},
						{
							match: /(liferay-versions=)\d(?:\.\d+)+\+?/g,
							replacement: '$17.2.0+',
						},
					],
				})
			)
			.pipe(gulp.dest('src/WEB-INF'));
	});

	return function(cb) {
		runSequence('upgrade:config', 'upgrade:dependencies', cb);
	};
};
