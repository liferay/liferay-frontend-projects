/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const colors = require('ansi-colors');
const log = require('fancy-log');
const fs = require('fs-extra');
const {
	default: FilePath,
} = require('liferay-npm-build-tools-common/lib/file-path');
const _ = require('lodash');
const path = require('path');

const project = require('../../lib/project');
const KickstartPrompt = require('../prompts/kickstart_prompt');

function registerTasks() {
	const {gulp} = project;
	const {pathSrc} = project.options;

	gulp.task('kickstart', cb => {
		log(
			colors.yellow('Warning:'),
			'the',
			colors.cyan('kickstart'),
			'task will potentially overwrite files in your src directory'
		);

		KickstartPrompt.prompt(
			{
				themeConfig: project.themeConfig.config,
			},
			answers => {
				let tempNodeModulesPath;
				let themeSrcPath;

				if (answers.modulePath) {
					themeSrcPath = new FilePath(answers.modulePath);
				} else if (answers.module) {
					tempNodeModulesPath = new FilePath(
						path.join(project.dir, '.temp_node_modules')
					);

					themeSrcPath = tempNodeModulesPath.join(
						'node_modules',
						answers.module,
						'src'
					);
				}

				if (themeSrcPath) {
					const globs = _.map(
						['css', 'images', 'js', 'templates'],
						folder => themeSrcPath.join(folder, '**', '*').asPosix
					);

					gulp.src(globs, {
						base: themeSrcPath.asNative,
					})
						.pipe(gulp.dest(pathSrc.asNative))
						.on('end', () => {
							if (tempNodeModulesPath) {
								fs.removeSync(tempNodeModulesPath.asNative);
								cb();
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
