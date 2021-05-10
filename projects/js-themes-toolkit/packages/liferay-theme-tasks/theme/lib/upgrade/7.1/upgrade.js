/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const insert = require('gulp-insert');
const inquirer = require('inquirer');

const {
	theme: themeDevDependencies,
} = require('../../../../lib/devDependencies');
const project = require('../../../../lib/project');

module.exports = function () {
	const {gulp, themeConfig} = project;
	const devDependencies = themeDevDependencies['7.2'];

	let includeFontAwesome;

	gulp.task('upgrade:config:liferay-font-awesome', (cb) => {
		themeConfig.setConfig({
			fontAwesome: includeFontAwesome,
		});

		cb();
	});

	gulp.task('upgrade:dependencies:liferay-theme-deps-7.1', (cb) => {
		project.removeDependencies(['liferay-theme-deps-7.1']);

		cb();
	});

	gulp.task('upgrade:dependencies:liferay-font-awesome', (cb) => {
		if (includeFontAwesome) {
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

		cb();
	});

	gulp.task('upgrade:css:liferay-font-awesome', (cb) => {
		if (includeFontAwesome) {
			return gulp
				.src('src/css/_custom.scss')
				.pipe(
					insert.prepend(
						"@import 'liferay-font-awesome/scss/font-awesome';\n" +
							"@import 'liferay-font-awesome/scss/glyphicons';\n\n"
					)
				)
				.pipe(gulp.dest('src/css/'));
		}

		cb();
	});

	gulp.task('upgrade:prompt', (cb) => {
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
				includeFontAwesome = answers.includeFontAwesome;

				cb();
			}
		);
	});

	return {
		customTasks: [
			'upgrade:config:liferay-font-awesome',
			'upgrade:dependencies:liferay-theme-deps-7.1',
			'upgrade:dependencies:liferay-font-awesome',
			'upgrade:css:liferay-font-awesome',
		],
		promptTask: 'upgrade:prompt',
		targetVersion: '7.2',
	};
};
