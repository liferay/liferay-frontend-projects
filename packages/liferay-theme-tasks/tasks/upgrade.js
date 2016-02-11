'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var del = require('del');
var fs = require('fs-extra');
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var lfrThemeConfig = require('../lib/liferay_theme_config.js');
var path = require('path');
var plugins = require('gulp-load-plugins')();

var version = argv.v || argv.version;

var themeConfig = lfrThemeConfig.getConfig();

module.exports = function(options) {
	var gulp = options.gulp;

	var runSequence = require('run-sequence').use(gulp);

	version = version ? version.toString() : themeConfig.version;

	var modulePath = path.join(__dirname, '../lib/upgrade', version, 'upgrade.js');

	var versionUpgradeTask;

	if (fs.existsSync(modulePath)) {
		versionUpgradeTask = require(modulePath)(options);
	}

	gulp.task('upgrade', function(cb) {
		if (_.isFunction(versionUpgradeTask)) {
			runSequence('upgrade:create-backup-files', function() {
				versionUpgradeTask(cb);
			});
		}
		else {
			throw new gutil.PluginError('gulp-theme-upgrader', gutil.colors.red('Version specific upgrade task must return function.'));
		}
	});

	gulp.task('upgrade:create-backup-files', function(cb) {
		var backupExists = fs.existsSync('_backup');

		var backup = function() {
			gulp.src('src/**/*')
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

		var noBackupErr = new gutil.PluginError('gulp-theme-upgrader', gutil.colors.red('No backup files found!'));

		if (!backupExists) throw noBackupErr;

		inquirer.prompt([
			{
				message: 'Are you sure you want to revert src files? This will replace the files in your src directory and your package.json file with those from the _backup directory.',
				name: 'revert',
				type: 'confirm'
			}
		], function(answers) {
			if (answers.revert) {
				del.sync('src/**/*');

				gulp.src('_backup/src/**/*')
					.pipe(gulp.dest('src'))
					.on('end', function() {
						gulp.src('_backup/_package.json')
							.pipe(plugins.rename('package.json'))
							.pipe(gulp.dest(process.cwd()))
							.on('end', cb);
					});
			}
			else {
				gutil.log(gutil.colors.cyan('No files reverted.'));

				cb();
			}
		});
	});
};