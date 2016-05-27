'use strict';

var del = require('del');
var lfrThemeConfig = require('../lib/liferay_theme_config.js');
var livereload = require('gulp-livereload');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var WatchSocket = require('../lib/watch_socket.js');

var gutil = plugins.util;

var themeConfig = lfrThemeConfig.getConfig();

var CONNECT_PARAMS = {
	port: 11311
};

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	var pathBuild = options.pathBuild;
	var pathSrc = options.pathSrc;

	var argv = options.argv;

	var fullDeploy = (argv.full || argv.f);

	var runSequence = require('run-sequence').use(gulp);

	var staticFileDirs = ['images', 'js'];

	var webBundleDirName = '.web_bundle_build';

	var webBundleDir = path.join(process.cwd(), webBundleDirName);

	gulp.task('watch', function() {
		if (themeConfig.version == '6.2') {
			startWatch();
		}
		else {
			store.set('appServerPathPlugin', webBundleDir);

			runSequence('build', 'watch:clean', 'watch:setup', function() {
				var watchSocket = startWatchSocket();

				watchSocket.connect(CONNECT_PARAMS)
					.then(function() {
						return watchSocket.deploy();
					})
					.then(function() {
						store.set('webBundleDir', 'watching');

						startWatch();
					});
			});
		}
	});

	gulp.task('watch:clean', function(cb) {
		del([webBundleDir], cb);
	});

	gulp.task('watch:setup', function() {
		return gulp.src(path.join(pathBuild, '**/*'))
			.pipe(gulp.dest(webBundleDir));
	});

	gulp.task('watch:teardown', function(cb) {
		var watchSocket = startWatchSocket();

		var end = function() {
			watchSocket.end();

			cb();
		};

		watchSocket.connect(CONNECT_PARAMS)
			.then(function() {
				return watchSocket.undeploy();
			})
			.then(function() {
				store.set('webBundleDir');

				runSequence('watch:clean', end);
			});
	});

	function clearChangedFile() {
		store.set('changedFile');
	}

	function getTaskArray(rootDir, defaultTaskArray) {
		var taskArray = defaultTaskArray || [];

		if (staticFileDirs.indexOf(rootDir) > -1) {
			taskArray = ['deploy:file'];
		}
		else if (rootDir == 'WEB-INF') {
			taskArray = ['build:clean', 'build:src', 'build:web-inf', 'deploy:folder'];
		}
		else if (rootDir == 'templates') {
			taskArray = ['build:src', 'build:themelet-src', 'build:themelet-js-inject', 'deploy:folder'];
		}
		else if (rootDir == 'css') {
			taskArray = [
				'build:clean',
				'build:base',
				'build:src',
				'build:themelet-src',
				'build:themelet-css-inject',
				'build:rename-css-dir',
				'build:prep-css',
				'build:compile-css',
				'build:move-compiled-css',
				'build:remove-old-css-dir',
				'deploy:css-files'
			];
		}

		return taskArray;
	}

	function startWatch() {
		clearChangedFile();

		livereload.listen();

		gulp.watch(path.join(pathSrc, '**/*'), function(vinyl) {
			store.set('changedFile', vinyl);

			var relativeFilePath = path.relative(path.join(process.cwd(), pathSrc), vinyl.path);

			var fileExt = path.extname(relativeFilePath);

			var filePathArray = relativeFilePath.split(path.sep);

			var rootDir = filePathArray.length ? filePathArray[0] : '';

			var taskArray = ['deploy'];

			if (themeConfig.version != '6.2') {
				taskArray = ['deploy:gogo'];
			}

			if (!fullDeploy && store.get('deployed')) {
				taskArray = getTaskArray(rootDir, taskArray);
			}

			taskArray.push(clearChangedFile);

			runSequence.apply(this, taskArray);
		});
	}

	function startWatchSocket() {
		var watchSocket = new WatchSocket({
			webBundleDir: webBundleDirName
		});

		watchSocket.on('error', function(err) {
			if (err.code == 'ECONNREFUSED' || err.errno == 'ECONNREFUSED') {
				gutil.log(gutil.colors.yellow('Cannot connect to gogo shell. Please ensure local Liferay instance is running.'));
			}
		});

		return watchSocket;
	}
};
