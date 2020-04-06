/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const spawn = require('cross-spawn');
const insert = require('gulp-insert');
const replace = require('gulp-replace-task');
const inquirer = require('inquirer');

const project = require('../../../../lib/project');
const devDependencies = require('../../../../lib/devDependencies')['theme'][
	'7.2'
];

module.exports = function() {
	const options = {...project.options};
	const {gulp, themeConfig} = project;
	const {runSequence} = gulp;

	gulp.task('upgrade:dependencies', cb => {
		project.removeDependencies(['liferay-theme-deps-7.1']);
		project.setDependencies(devDependencies.default, true);

		if (options.includeFontAwesome) {
			project.setDependencies(
				{
					'liferay-font-awesome':
						devDependencies.optional['liferay-font-awesome'],
				},
				true
			);
		} else {
			project.removeDependencies(['liferay-font-awesome']);
		}

		const npmInstall = spawn('npm', ['install']);

		npmInstall.stderr.pipe(process.stderr);
		npmInstall.stdout.pipe(process.stdout);

		npmInstall.on('close', cb);
	});

	gulp.task('upgrade:config', () => {
		themeConfig.setConfig({
			fontAwesome: options.includeFontAwesome,
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

	gulp.task('upgrade:fontAwesome', () => {
		return gulp
			.src('src/css/_custom.scss')
			.pipe(
				insert.prepend(
					"@import 'liferay-font-awesome/scss/font-awesome';\n" +
						"@import 'liferay-font-awesome/scss/glyphicons';\n\n"
				)
			)
			.pipe(gulp.dest('src/css/'));
	});

	return function(cb) {
		inquirer.prompt(
			[
				{
					default: true,
					message:
						'Do you want to include Font Awesome in your theme?',
					name: 'includeFontAwesome',
					type: 'confirm',
				},
			],
			answers => {
				const taskArray = ['upgrade:config', 'upgrade:dependencies'];

				if (answers.includeFontAwesome) {
					taskArray.push('upgrade:fontAwesome');
				}

				taskArray.push(cb);

				Object.assign(options, answers);

				runSequence(...taskArray);
			}
		);
	};
};
