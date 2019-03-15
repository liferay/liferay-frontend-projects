/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const _ = require('lodash');
const colors = require('ansi-colors');
const del = require('del');
const log = require('fancy-log');
const path = require('path');

const KickstartPrompt = require('../lib/prompts/kickstart_prompt');
const lfrThemeConfig = require('../lib/liferay_theme_config');

function registerTasks(options) {
	const gulp = options.gulp;
	const pathSrc = options.pathSrc;

	gulp.task('kickstart', function(cb) {
		log(
			colors.yellow('Warning:'),
			'the',
			colors.cyan('kickstart'),
			'task will potentially overwrite files in your src directory'
		);

		KickstartPrompt.prompt(
			{
				themeConfig: lfrThemeConfig.getConfig(),
			},
			function(answers) {
				let tempNodeModulesPath;
				let themeSrcPath;

				if (answers.modulePath) {
					themeSrcPath = answers.modulePath;
				} else if (answers.module) {
					tempNodeModulesPath = path.join(
						process.cwd(),
						'.temp_node_modules'
					);

					themeSrcPath = path.join(
						tempNodeModulesPath,
						'node_modules',
						answers.module,
						'src'
					);
				}

				if (themeSrcPath) {
					const globs = _.map(
						['css', 'images', 'js', 'templates'],
						function(folder) {
							return path.join(themeSrcPath, folder, '**/*');
						}
					);

					gulp.src(globs, {
						base: themeSrcPath,
					})
						.pipe(gulp.dest(pathSrc))
						.on('end', function() {
							if (tempNodeModulesPath) {
								del([tempNodeModulesPath]).then(() => cb());
							} else {
								cb();
							}
						});
				} else {
					log(colors.yellow('Theme not selected'));

					cb();
				}
			}
		);
	});
}

module.exports = registerTasks;
