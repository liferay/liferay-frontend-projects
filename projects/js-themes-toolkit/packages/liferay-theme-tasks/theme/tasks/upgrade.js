/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const colors = require('ansi-colors');
const spawn = require('cross-spawn');
const log = require('fancy-log');
const fs = require('fs-extra');
const replace = require('gulp-replace-task');
const inquirer = require('inquirer');
const path = require('path');
const PluginError = require('plugin-error');

const {theme: themeDevDependencies} = require('../../lib/devDependencies');
const project = require('../../lib/project');

module.exports = function () {
	const {gulp, pkgJson} = project;
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

	let addBootstrapCompat;
	let versionUpgrade;

	if (fs.existsSync(modulePath)) {
		// eslint-disable-next-line @liferay/no-dynamic-require
		versionUpgrade = require(modulePath)();
	}

	gulp.task('upgrade', (callback) => {
		if (!versionUpgrade) {
			throw new PluginError(
				'gulp-theme-upgrader',
				colors.red(
					'No upgrade process from version ' + version + ' available'
				)
			);
		}

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
					default: false,
					message:
						'Would you like to add the Bootstrap 3 to 4 compatibility layer?',
					name: 'bootstrapCompat',
					type: 'confirm',
					when: () => {
						return (
							(themeConfig.baseTheme === 'styled' ||
								themeConfig.baseTheme === 'classic') &&
							versionUpgrade.targetVersion === '7.4'
						);
					},
				},
			],
			(answers) => {
				if (
					answers.bootstrapCompat &&
					themeConfig.baseTheme === 'styled'
				) {
					addBootstrapCompat = true;
				}

				if (answers.sure) {
					doVersionUpgrade(gulp, versionUpgrade, callback);
				}
				else {
					callback();
				}
			}
		);
	});

	gulp.task('upgrade:config', () => {
		const {targetVersion} = versionUpgrade;
		const dotTargetVersion = targetVersion + '.0';
		const underscoreTargetVersion = dotTargetVersion.replace(/\./g, '_');

		project.themeConfig.setConfig({
			version: targetVersion,
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
							replacement: '$1' + dotTargetVersion + '$2',
						},
						{
							match: /(liferay-look-and-feel_)\d(?:_\d+)+(\.dtd)/g,
							replacement: '$1' + underscoreTargetVersion + '$2',
						},
						{
							match: /(<version>).+(<\/version>)/g,
							replacement: '$1' + dotTargetVersion + '+$2',
						},
						{
							match: /(liferay-versions=)\d(?:\.\d+)+\+?/g,
							replacement: '$1' + dotTargetVersion + '+',
						},
					],
				})
			)
			.pipe(gulp.dest('src/WEB-INF'));
	});

	gulp.task('upgrade:dependencies', (callback) => {
		const devDependencies =
			themeDevDependencies[versionUpgrade.targetVersion];

		project.setDependencies(devDependencies.default, true);

		if (addBootstrapCompat) {
			project.setDependencies({'@liferay/bs3-bs4-compat': '*'});
		}

		Object.entries(devDependencies.optional).forEach(
			([packageName, version]) => {
				if (pkgJson.devDependencies[packageName]) {
					const modification = {};

					modification[packageName] = version;

					project.setDependencies(modification, true);
				}
			}
		);

		const npmInstall = spawn('npm', ['install']);

		npmInstall.stderr.pipe(process.stderr);
		npmInstall.stdout.pipe(process.stdout);

		npmInstall.on('close', callback);
	});

	gulp.task('upgrade:css', () => {
		if (addBootstrapCompat) {
			if (!fs.existsSync('src/css/clay.scss')) {
				if (themeConfig.baseTheme === 'styled') {
					fs.writeFileSync(
						'src/css/clay.scss',
						"@import 'clay/base';"
					);
				}
				else if (themeConfig.baseTheme === 'classic') {
					fs.writeFileSync(
						'src/css/clay.scss',
						"@import 'clay/atlas';"
					);
				}
			}

			return gulp
				.src('src/css/+(clay.scss)')
				.pipe(
					replace({
						patterns: [
							{
								match: /(@import\s'clay\/atlas';)/g,
								replacement:
									'$1' +
									'\n\n' +
									"@import '@liferay/bs3-bs4-compat/scss/variables';" +
									'\n\n' +
									"@import '@liferay/bs3-bs4-compat/scss/atlas_variables';" +
									'\n\n' +
									"@import '@liferay/bs3-bs4-compat/scss/components';",
							},
							{
								match: /(@import\s'clay\/base';)/g,
								replacement:
									'$1' +
									'\n\n' +
									"@import '@liferay/bs3-bs4-compat/scss/variables';" +
									'\n\n' +
									"@import '@liferay/bs3-bs4-compat/scss/components';",
							},
						],
					})
				)
				.pipe(gulp.dest('src/css'));
		}
	});
};

function doVersionUpgrade(gulp, versionUpgrade, callback) {
	const taskArray = [];

	if (versionUpgrade.promptTask) {
		taskArray.push(versionUpgrade.promptTask);
	}

	taskArray.push('upgrade:config', 'upgrade:dependencies', 'upgrade:css');

	if (versionUpgrade.customTasks) {
		taskArray.push(...versionUpgrade.customTasks);
	}

	taskArray.push((error) => {
		if (error) {
			log(
				colors.red('Error:'),
				'something went wrong during the upgrade task - ' +
					'leaving the theme files in place for inspection.'
			);
			log(error);
		}

		callback();
	});

	gulp.runSequence(...taskArray);
}
