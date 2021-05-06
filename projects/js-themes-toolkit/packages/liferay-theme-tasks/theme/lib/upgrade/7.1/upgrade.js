/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const insert = require('gulp-insert');
const inquirer = require('inquirer');

const devDependencies = require('../../../../lib/devDependencies')['theme'][
	'7.2'
];
const project = require('../../../../lib/project');
const {upgradeDependencies, upgradeConfig} = require('../common');

const TARGET_VERSION = '7.2';

module.exports = function () {
	const options = {...project.options};
	const {gulp, themeConfig} = project;
	const {runSequence} = gulp;

	gulp.task('upgrade:dependencies', (cb) => {
		project.removeDependencies(['liferay-theme-deps-7.1']);

		if (options.includeFontAwesome) {
			project.setDependencies(
				{
					'liferay-font-awesome':
						devDependencies.optional['liferay-font-awesome'],
				},
				true
			);
		}
		else {
			project.removeDependencies(['liferay-font-awesome']);
		}

		upgradeDependencies(TARGET_VERSION, cb);
	});

	gulp.task('upgrade:config', () => {
		themeConfig.setConfig({
			fontAwesome: options.includeFontAwesome,
		});

		return upgradeConfig(TARGET_VERSION);
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

	return function (cb) {
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
			(answers) => {
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
