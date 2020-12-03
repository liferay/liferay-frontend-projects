/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const colors = require('ansi-colors');
const log = require('fancy-log');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const _ = require('lodash');
const path = require('path');
const PluginError = require('plugin-error');

const project = require('../../lib/project');

module.exports = function() {
	const {gulp} = project;
	const {argv} = project.options;

	const themeConfig = project.themeConfig.config;

	// If not inside a theme, don't register tasks
	if (!themeConfig) {
		return;
	}

	let version = argv.v || argv.version;

	version = version ? version.toString() : themeConfig.version;

	const modulePath = path.join(
		__dirname,
		'..',
		'lib',
		'upgrade',
		version,
		'upgrade.js'
	);

	let versionUpgradeTask;

	if (fs.existsSync(modulePath)) {
		// eslint-disable-next-line liferay/no-dynamic-require
		versionUpgradeTask = require(modulePath)();
	}

	gulp.task('upgrade', cb => {
		if (_.isFunction(versionUpgradeTask)) {
			inquirer.prompt(
				[
					{
						default: false,
						message:
							'We recommend creating a backup of your theme files before proceeding. ' +
							'Are you sure you wish to start the upgrade process?',
						name: 'sure',
						type: 'confirm',
					},
				],
				answers => {
					if (answers.sure) {
						versionUpgradeTask(err => {
							if (err) {
								log(
									colors.red('Error:'),
									'something went wrong during the upgrade task - ' +
										'leaving the theme files in place for inspection.'
								);
								log(err);
							}
							cb();
						});
					} else {
						cb();
					}
				}
			);
		} else {
			throw new PluginError(
				'gulp-theme-upgrader',
				colors.red(
					'Version specific upgrade task must return function.'
				)
			);
		}
	});
};
