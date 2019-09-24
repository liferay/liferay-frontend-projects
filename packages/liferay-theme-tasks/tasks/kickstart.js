/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const colors = require('ansi-colors');
const del = require('del');
const log = require('fancy-log');
const _ = require('lodash');
const path = require('path');

const lfrThemeConfig = require('../lib/liferay_theme_config');
const KickstartPrompt = require('../lib/prompts/kickstart_prompt');

function registerTasks(options) {
	const gulp = options.gulp;
	const pathSrc = options.pathSrc;

	gulp.task('kickstart', cb => {
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
			answers => {
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
						folder => {
							return path.join(themeSrcPath, folder, '**/*');
						}
					);

					gulp.src(globs, {
						base: themeSrcPath,
					})
						.pipe(gulp.dest(pathSrc))
						.on('end', () => {
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
