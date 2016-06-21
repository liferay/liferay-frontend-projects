'use strict';

var _ = require('lodash');
var del = require('del');
var fs = require('fs-extra');
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var path = require('path');
var plugins = require('gulp-load-plugins')();

var lfrThemeConfig = require('../lib/liferay_theme_config.js');

var chalk = gutil.colors;

var themeConfig = lfrThemeConfig.getConfig();

module.exports = function(options) {
	var gulp = options.gulp;

	var runSequence = require('run-sequence').use(gulp);

	var argv = options.argv;
	var pathSrc = options.pathSrc;

	var version = argv.v || argv.version;

	version = version ? version.toString() : themeConfig.version;

	var modulePath = path.join(__dirname, '../lib/upgrade', version, 'upgrade.js');

	var versionUpgradeTask;

	if (fs.existsSync(modulePath)) {
		versionUpgradeTask = require(modulePath)(options);
	}

	gulp.task('upgrade', function(cb) {
		if (_.isFunction(versionUpgradeTask)) {
			runSequence('upgrade:create-backup-files', function() {
				versionUpgradeTask(function(err) {
					if (err) {
						gutil.log(chalk.red('Error:'), 'something went wrong during the upgrade task, reverting changes.');
						gutil.log(err);

						runSequence('upgrade:revert-src', cb);
					}
					else {
						cb();
					}
				});
			});
		}
		else {
			throw new gutil.PluginError('gulp-theme-upgrader', chalk.red('Version specific upgrade task must return function.'));
		}
	});

	gulp.task('upgrade:create-backup-files', function(cb) {
		var backupExists = fs.existsSync('_backup');

		var backup = function() {
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
			inquirer.prompt({
				default: false,
				message: 'Would you like to overwrite the existing _backup directory and it\'s contents?',
				name: 'backup',
				type: 'confirm'
			}, function(answers) {
				if (answers.backup) {
					backup();
				}
				else {
					cb();
				}
			});
		}
		else {
			backup();
		}
	});

	gulp.task('upgrade:revert', function(cb) {
		var backupExists = (fs.existsSync('_backup/src') && fs.statSync('_backup/src').isDirectory());

		if (!backupExists) {
			throw new gutil.PluginError('gulp-theme-upgrader', chalk.red('No backup files found!'));
		}

		inquirer.prompt([
			{
				message: 'Are you sure you want to revert src files? This will replace the files in your src directory and your package.json file with those from the _backup directory.',
				name: 'revert',
				type: 'confirm'
			}
		], function(answers) {
			if (answers.revert) {
				runSequence('upgrade:revert-src', cb);
			}
			else {
				gutil.log(chalk.cyan('No files reverted.'));

				cb();
			}
		});
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
