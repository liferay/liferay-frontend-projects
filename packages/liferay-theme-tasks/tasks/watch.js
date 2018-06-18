'use strict';

const _ = require('lodash');
const colors = require('ansi-colors');
const del = require('del');
const log = require('fancy-log');
const path = require('path');

const lfrThemeConfig = require('../lib/liferay_theme_config.js');
const WatchSocket = require('../lib/watch_socket.js');

const themeConfig = lfrThemeConfig.getConfig();

const browserSync = require('browser-sync').create('liferay-theme-tasks');
const portfinder = require('portfinder');

portfinder.basePort = 9080;

const deployTask = 'deploy:gogo';
const CONNECT_PARAMS = {
	port: 11311,
};
const staticFileDirs = ['images', 'js'];
const webBundleDirName = '.web_bundle_build';

module.exports = function(options) {
	const {argv, gulp, pathBuild, pathSrc} = options;
	const {storage} = gulp;

	const connectParams = _.assign({}, CONNECT_PARAMS, options.gogoShellConfig);
	const fullDeploy = argv.full || argv.f;
	const runSequence = require('run-sequence').use(gulp);
	const url = argv.url || storage.get('url');
	const webBundleDir = path.join(process.cwd(), webBundleDirName);

	gulp.browserSync = browserSync;

	gulp.task('watch', function() {
		options.watching = true;

		storage.set('appServerPathPlugin', webBundleDir);

		runSequence(
			'build',
			'watch:clean',
			'watch:osgi:clean',
			'watch:setup',
			function(err) {
				if (err) {
					throw err;
				}

				let watchSocket = startWatchSocket();

				watchSocket
					.connect(connectParams)
					.then(function() {
						return watchSocket.deploy();
					})
					.then(function() {
						storage.set('webBundleDir', 'watching');

						portfinder.getPortPromise().then(port => {
							startWatch(port, url);
						});
					});
			}
		);
	});

	gulp.task('watch:clean', function(cb) {
		del([webBundleDir], cb);
	});

	gulp.task('watch:osgi:clean', function(cb) {
		let watchSocket = startWatchSocket();

		watchSocket
			.connect(connectParams)
			.then(function() {
				let distName = options.distName;

				let warPath = path.join(
					storage.get('appServerPath'),
					'..',
					'osgi',
					'war',
					distName + '.war'
				);

				return watchSocket.uninstall(warPath, distName);
			})
			.then(cb);
	});

	gulp.task('watch:setup', function() {
		return gulp
			.src(path.join(pathBuild, '**/*'))
			.pipe(gulp.dest(webBundleDir));
	});

	gulp.task('watch:teardown', function(cb) {
		storage.set('webBundleDir');

		runSequence('watch:clean', cb);
	});

	function clearChangedFile() {
		storage.set('changedFile');
	}

	function getTaskArray(rootDir, defaultTaskArray) {
		let taskArray = defaultTaskArray || [];

		if (staticFileDirs.indexOf(rootDir) > -1) {
			taskArray = ['deploy:file'];
		} else if (rootDir === 'WEB-INF') {
			taskArray = [
				'build:clean',
				'build:src',
				'build:web-inf',
				'deploy:folder',
			];
		} else if (rootDir === 'templates') {
			taskArray = [
				'build:src',
				'build:themelet-src',
				'build:themelet-js-inject',
				'deploy:folder',
			];
		} else if (rootDir === 'css') {
			taskArray = [
				'build:clean',
				'build:base',
				'build:src',
				'build:themelet-src',
				'build:themelet-css-inject',
				'build:rename-css-dir',
				'build:compile-css',
				'build:move-compiled-css',
				'build:remove-old-css-dir',
				'deploy:css-files',
			];
		}

		return taskArray;
	}

	function startWatch(port, url) {
		clearChangedFile();

		const target = url || 'http://localhost:8080';
		const targetPort = /^(.*:)\/\/([A-Za-z0-9\-\.]+)(:([0-9]+))?(.*)$/.exec(
			target
		);

		browserSync.init({
			rewriteRules: [
				{
					match: new RegExp(targetPort || 8080, 'g'),
					replace: port,
				},
			],
			proxy: {
				target: target,
				ws: true,
			},
			open: true,
			port: port,
			ui: false,
			reloadDelay: 500,
			reloadOnRestart: true,
		});

		gulp.watch(path.join(pathSrc, '**/*'), function(vinyl) {
			storage.set('changedFile', vinyl);

			let relativeFilePath = path.relative(
				path.join(process.cwd(), pathSrc),
				vinyl.path
			);

			let filePathArray = relativeFilePath.split(path.sep);

			let rootDir = filePathArray.length ? filePathArray[0] : '';

			let taskArray = [deployTask];

			if (!fullDeploy && storage.get('deployed')) {
				taskArray = getTaskArray(rootDir, taskArray);
			}

			taskArray.push(clearChangedFile);

			runSequence.apply(this, taskArray);
		});
	}

	function startWatchSocket() {
		let watchSocket = new WatchSocket({
			webBundleDir: webBundleDirName,
		});

		watchSocket.on('error', function(err) {
			if (err.code === 'ECONNREFUSED' || err.errno === 'ECONNREFUSED') {
				log(
					colors.yellow(
						'Cannot connect to gogo shell. Please ensure local Liferay instance is running.'
					)
				);
			}
		});

		return watchSocket;
	}
};
