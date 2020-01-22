/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const spawn = require('cross-spawn');
const replace = require('gulp-replace-task');

const lfrThemeConfig = require('../../liferay_theme_config');
const devDependencies = require('../../devDependencies')['theme']['7.3'];

module.exports = function(options) {
	const gulp = options.gulp;

	const runSequence = require('run-sequence').use(gulp);

	const pkgJson = lfrThemeConfig.getConfig(true);

	gulp.task('upgrade:dependencies', cb => {
		lfrThemeConfig.setDependencies(devDependencies.default, true);

		if (pkgJson.devDependencies['liferay-font-awesome']) {
			lfrThemeConfig.setDependencies(
				{
					'liferay-font-awesome':
						devDependencies.optional['liferay-font-awesome'],
				},
				true
			);
		}
		const npmInstall = spawn('npm', ['install']);

		npmInstall.stderr.pipe(process.stderr);
		npmInstall.stdout.pipe(process.stdout);

		npmInstall.on('close', cb);
	});

	gulp.task('upgrade:config', () => {
		lfrThemeConfig.setConfig({
			version: '7.3',
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
							replacement: '$17.3.0$2',
						},
						{
							match: /(liferay-look-and-feel_)\d(?:_\d+)+(\.dtd)/g,
							replacement: '$17_3_0$2',
						},
						{
							match: /(<version>).+(<\/version>)/g,
							replacement: '$17.3.0+$2',
						},
						{
							match: /(liferay-versions=)\d(?:\.\d+)+\+?/g,
							replacement: '$17.3.0+',
						},
					],
				})
			)
			.pipe(gulp.dest('src/WEB-INF'));
	});

	return function(cb) {
		const taskArray = ['upgrade:config', 'upgrade:dependencies'];

		taskArray.push(cb);

		runSequence.apply(this, taskArray);
	};
};
