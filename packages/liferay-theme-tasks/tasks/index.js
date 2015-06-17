'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var async = require('async');
var CheckSourceFormattingCLI = require('../node_modules/check-source-formatting/lib/cli').constructor;
var del = require('del');
var fs = require('fs-extra');
var glob = require('glob');
var inquirer = require('inquirer');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var runSequence = require('run-sequence');

var buildTasks = require('./build');
var deployTasks = require('./deploy');
var initTasks = require('./init');

module.exports = function(options) {
	var gulp = options.gulp;

	var runSequence = require('run-sequence').use(gulp);

	plugins.storage(gulp);

	var store = gulp.storage;

	store.create('LiferayTheme', 'liferay-theme.json');

	buildTasks(options);
	deployTasks(options);
	initTasks(options);

	var fullDeploy = (argv.full || argv.f);

	var pathBuild = './build';

	gulp.task(
		'build',
		function(cb) {
			runSequence(
				'build:clean',
				'build:base',
				'build:src',
				'build:web-inf',
				'build:hook',
				'rename-css-dir',
				'compile-scss',
				'move-compiled-css',
				'remove-old-css-dir',
				'build:war',
				cb
			);
		}
	);

	gulp.task(
		'deploy',
		function(cb) {
			runSequence(
				'build',
				'deploy:war',
				cb
			)
		}
	);

	gulp.task(
		'watch',
		function() {
			gulp.watch(
				'src/**/*',
				function(vinyl) {
					store.set('changedFile', vinyl);

					if (!fullDeploy && store.get('deployed')) {
						runSequence(
							'build:src',
							'build:web-inf',
							'rename-css-dir',
							'compile-scss',
							'move-compiled-css',
							'remove-old-css-dir',
							'deploy:fast',
							function() {
								store.set('changedFile');
							}
						);
					}
					else {
						runSequence(
							'deploy',
							function() {
								store.set('changedFile');
							}
						);
					}
				}
			);
		}
	);
}