'use strict';

const _ = require('lodash');
const colors = require('ansi-colors');
const del = require('del');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const log = require('fancy-log');
const path = require('path');
const plugins = require('gulp-load-plugins')();
const PluginError = require('plugin-error');

const lfrThemeConfig = require('../lib/liferay_theme_config.js');

const themeConfig = lfrThemeConfig.getConfig();

module.exports = function(options) {
	let gulp = options.gulp;

	let runSequence = require('run-sequence').use(gulp);

	let argv = options.argv;
	let pathSrc = options.pathSrc;

	let version = argv.v || argv.version;

	version = version ? version.toString() : themeConfig.version;

	let modulePath = path.join(
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
			runSequence('upgrade:create-backup-files', function() {
				versionUpgradeTask(function(err) {
					if (err) {
						log(
							colors.red('Error:'),
							'something went wrong during the upgrade task, reverting changes.'
						);
						log(err);

						runSequence('upgrade:revert-src', cb);
					} else {
						cb();
					}
				});
			});
		} else {
			throw new PluginError(
				'gulp-theme-upgrader',
				colors.red(
					'Version specific upgrade task must return function.'
				)
			);
		}
	});

	gulp.task('upgrade:create-backup-files', function(cb) {
		let backupExists = fs.existsSync('_backup');

		let backup = function() {
			gulp.src(path.join(pathSrc, '**/*'))
				.pipe(gulp.dest('_backup/src'))
				.on('end', function() {
					gulp.src('package.json')
						.pipe(plugins.rename('_package.json'))
						.pipe(gulp.dest('_backup'))
						.on('end', cb);
				});
		};

		if (backupExists) {
			inquirer.prompt(
				{
					default: false,
					message:
						'Would you like to overwrite the existing _backup directory and it\'s contents?',
					name: 'backup',
					type: 'confirm',
				},
				function(answers) {
					if (answers.backup) {
						backup();
					} else {
						cb();
					}
				}
			);
		} else {
			backup();
		}
	});

	gulp.task('upgrade:revert', function(cb) {
		let backupExists =
			fs.existsSync('_backup/src') &&
			fs.statSync('_backup/src').isDirectory();

		if (!backupExists) {
			throw new PluginError(
				'gulp-theme-upgrader',
				colors.red('No backup files found!')
			);
		}

		inquirer.prompt(
			[
				{
					message:
						'Are you sure you want to revert src files? This will replace the files in your src directory and your package.json file with those from the _backup directory.',
					name: 'revert',
					type: 'confirm',
				},
			],
			function(answers) {
				if (answers.revert) {
					runSequence('upgrade:revert-src', cb);
				} else {
					log(colors.cyan('No files reverted.'));

					cb();
				}
			}
		);
	});

	gulp.task('upgrade:revert-src', function(cb) {
		del.sync(path.join(pathSrc, '**/*'));

		gulp.src('_backup/src/**/*')
			.pipe(gulp.dest(pathSrc))
			.on('end', function() {
				gulp.src('_backup/_package.json')
					.pipe(plugins.rename('package.json'))
					.pipe(gulp.dest(process.cwd()))
					.on('end', cb);
			});
	});
};
