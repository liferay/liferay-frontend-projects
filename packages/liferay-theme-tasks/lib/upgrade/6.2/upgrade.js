'use strict';

var _ = require('lodash');
var del = require('del');
var fs = require('fs-extra');
var gulpBlackList = require('./black_list.js');
var inquirer = require('inquirer');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var replace = require('gulp-replace-task');

var CWD = process.cwd();

var DIR_SRC_CSS = 'src/css';

module.exports = function(options) {
	var gulp = options.gulp;

	var runSequence = require('run-sequence').use(gulp);

	var cssSrcPath = path.join(CWD, 'src/css/**/*.+(css|scss)');

	var patterns;

	gulp.task('upgrade', function(cb) {
		runSequence(
			'upgrade:create-backup-files',
			'upgrade:black-list',
			'upgrade:replace-compass',
			'upgrade:config',
			'upgrade:rename-core-files',
			'upgrade:create-css-diff',
			'upgrade:dependencies',
			cb
		);
	});

	gulp.task('upgrade:create-backup-files', function() {
		return gulp.src('src/css/**/*')
			.pipe(gulp.dest('_backup/src/css'));
	});

	gulp.task('upgrade:create-css-diff', function() {
		var gulpCssDiff = require('./css_diff.js');

		return gulp.src('src/css/**/*')
			.pipe(gulpCssDiff())
			.pipe(plugins.concat('css.diff'))
			.pipe(gulp.dest('_backup', {
				overwrite: true
			}));
	});

	gulp.task('upgrade:dependencies', function() {
		var themeTasksPath = path.join(CWD, 'node_modules/liferay-theme-tasks');

		process.chdir(themeTasksPath);

		var npm = require('../../../scripts/install.js');

		npm.on('dependenciesInstalled', function() {
			process.chdir(CWD);
		});
	});

	gulp.task('upgrade:black-list', function() {
		return gulp.src(cssSrcPath)
			.pipe(gulpBlackList(null, function(result) {
				patterns = require('./replace_patterns.js')(result);
			}));
	});

	gulp.task('upgrade:config', function() {
		var lfrThemeConfig = require('../../liferay_theme_config.js');

		lfrThemeConfig.setConfig({
			version: '7.0'
		});

		return gulp.src('src/WEB-INF/liferay-plugin-package.properties')
			.pipe(replace({
				patterns: [
					{
						match: /(liferay-versions=)6\.2\.\d+\+/g,
						replacement: '$17.0.0+'
					}
				]
			}))
			.pipe(gulp.dest('src/WEB-INF'));
	});

	gulp.task('upgrade:rename-core-files', function(cb) {
		var coreThemeStructure = require('./core_theme_structure.json');

		var prompts = [];
		var srcPaths = [];

		_.forEach(fs.readdirSync(path.join(CWD, DIR_SRC_CSS)), function(item, index) {
			var fileName = path.basename(item, '.css');

			if (path.extname(item) == '.css' && coreThemeStructure.indexOf(fileName) > -1) {
				srcPaths.push(path.join(CWD, DIR_SRC_CSS, item));

				prompts.push({
					message: 'Do you want to update the file extension of ' + item + ' to .scss?',
					name: item,
					type: 'confirm'
				});
			}
		});

		var promptResults;

		gulp.src(srcPaths)
			.pipe(plugins.prompt.prompt(prompts, function(results) {
				promptResults = results;
			}))
			.pipe(plugins.filter(function(file) {
				var fileName = path.basename(file.path);

				return promptResults[fileName];
			}))
			.pipe(plugins.rename({
				extname: '.scss'
			}))
			.pipe(gulp.dest(DIR_SRC_CSS))
			.on('end', function() {
				srcPaths = _.reduce(srcPaths, function(result, item, index) {
					var fileName = path.basename(item);

					if (promptResults[fileName]) {
						result.push(item);
					}

					return result;
				}, []);

				del(srcPaths, cb);
			});
	});

	gulp.task('upgrade:replace-compass', function() {
		return gulp.src(cssSrcPath)
			.pipe(plugins.debug())
			.pipe(replace({
				patterns: patterns
			}))
			.pipe(gulp.dest(DIR_SRC_CSS));
	});

	gulp.task('upgrade:revert-css', function(cb) {
		var gutil = plugins.util;

		var backupExists = (fs.existsSync('_backup/src/css') && fs.statSync('_backup/src/css').isDirectory());

		var noBackupErr = new plugins.util.PluginError('gulp-theme-upgrader', gutil.colors.red('No backup files found!'));

		if (!backupExists) throw noBackupErr;

		inquirer.prompt([
			{
				message: 'Are you sure you want to revert updated css? This will repalce css files in your src directory with those from _backup.',
				name: 'revert',
				type: 'confirm'
			}
		], function(answers) {
			if (answers.revert) {
				del.sync('src/css/**/*');

				gulp.src('_backup/src/css/**/*')
					.pipe(gulp.dest('src/css'))
					.on('end', cb);
			}
			else {
				plugins.util.log(gutil.colors.cyan('No css files reverted.'));

				cb();
			}
		});
	});
};