/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const _ = require('lodash');
const colors = require('ansi-colors');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const log = require('fancy-log');
const path = require('path');
const PluginError = require('plugin-error');

const lfrThemeConfig = require('../lib/liferay_theme_config.js');

const themeConfig = lfrThemeConfig.getConfig();

module.exports = function(options) {
	const gulp = options.gulp;
	const argv = options.argv;

	let version = argv.v || argv.version;

	version = version ? version.toString() : themeConfig.version;

	const modulePath = path.join(
		__dirname,
		'../lib/upgrade',
		version,
		'upgrade.js'
	);

	let versionUpgradeTask;

	if (fs.existsSync(modulePath)) {
		versionUpgradeTask = require(modulePath)(options);
	}

	gulp.task('upgrade', function(cb) {
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
					{
						default: true,
						message:
							'Do you want to include Font Awesome in your theme?',
						name: 'includeFontAwesome',
						type: 'confirm',
					},
				],
				function(answers) {
					if (answers.sure) {
						options.includeFontAwesome = answers.includeFontAwesome;

						versionUpgradeTask(function(err) {
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
