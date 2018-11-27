'use strict';

const _ = require('lodash');
const colors = require('ansi-colors');
const del = require('del');
const fs = require('fs-extra');
const log = require('fancy-log');
const path = require('path');

const lfrThemeConfig = require('../lib/liferay_theme_config.js');
const themeUtil = require('../lib/util');
const WatchSocket = require('../lib/watch_socket.js');

const themeConfig = lfrThemeConfig.getConfig();
const DEPLOYMENT_STRATEGIES = themeUtil.DEPLOYMENT_STRATEGIES;

const browserSync = require('browser-sync').create('liferay-theme-tasks');
const portfinder = require('portfinder');

portfinder.basePort = 9080;

const CONNECT_PARAMS = {
	port: 11311,
};
const webBundleDirName = '.web_bundle_build';

module.exports = function(options) {
	const {argv, gulp, pathBuild, pathSrc} = options;
	const {storage} = gulp;

	const connectParams = _.assign({},
		CONNECT_PARAMS,
		options.gogoShellConfig
	);
	const fullDeploy = argv.full || argv.f;
	const runSequence = require('run-sequence').use(gulp);
	const url = argv.url || storage.get('url');
	const webBundleDir = path.join(process.cwd(), webBundleDirName);
	const deploymentStrategy = storage.get('deploymentStrategy');
	const dockerContainerName = storage.get('dockerContainerName');
	const pluginName = storage.get('pluginName') || '';
	const dockerThemePath = path.posix.join('/tmp', pluginName);
	const dockerBundleDirPath = path.posix
		.join(dockerThemePath, webBundleDirName);

	gulp.browserSync = browserSync;

	gulp.task('watch', function() {
		let taskArray;
		options.watching = true;

		storage.set('appServerPathPlugin', webBundleDir);

		if (deploymentStrategy === DEPLOYMENT_STRATEGIES.DOCKER_CONTAINER) {
			taskArray = [
				'build',
				'watch:clean',
				'watch:docker:clean',
				'watch:osgi:clean',
				'watch:setup',
				'watch:docker:copy',
			];
		} else {
			taskArray = [
				'build',
				'watch:clean',
				'watch:osgi:clean',
				'watch:setup',
			];
		}

		taskArray.push(
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

		runSequence.apply(this, taskArray);
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

				let warPath = themeUtil.getPath(deploymentStrategy).join(
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

	gulp.task('watch:docker:clean', function(cb) {
		themeUtil.dockerExec(dockerContainerName,
			'rm -rf ' + dockerBundleDirPath);

		cb();
	});

	gulp.task('watch:docker:copy', function(cb) {
		themeUtil.dockerExec(dockerContainerName,
			'mkdir -p ' + dockerBundleDirPath);
		themeUtil.dockerCopy(dockerContainerName,
			webBundleDir, dockerBundleDirPath, cb);
	});

	gulp.task('watch:osgi:reinstall', function(cb) {
		let watchSocket = startWatchSocket();

		watchSocket
			.connect(connectParams)
			.then(function() {
				return watchSocket.deploy();
			})
			.then(function() {
				cb();
			});
	});

	gulp.task('watch:setup', function() {
		return gulp
			.src(path.join(pathBuild, '**/*'))
			.pipe(gulp.dest(webBundleDir));
	});

	gulp.task('watch:teardown', function(cb) {
		storage.set('webBundleDir');
		let sequence = ['watch:clean'];

		if (deploymentStrategy === DEPLOYMENT_STRATEGIES.DOCKER_CONTAINER) {
			sequence.push('watch:docker:clean');
		}

		sequence.push(cb);

		runSequence.apply(this, sequence);
	});

	function clearChangedFile() {
		storage.set('changedFile');
	}

	function getTaskArray(rootDir, defaultTaskArray) {
		let taskArray = defaultTaskArray || [];

		if (rootDir === 'WEB-INF') {
			taskArray = [
				'build:clean',
				'build:src',
				'build:web-inf',
				'watch:osgi:reinstall',
				'deploy:folder',
			];
		} else if (rootDir === 'templates') {
			taskArray = [
				'build:src',
				'build:themelet-src',
				'build:themelet-js-inject',
				'watch:osgi:reinstall',
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
				'watch:osgi:reinstall',
				'deploy:css-files',
			];
		} else {
			taskArray = ['watch:osgi:reinstall', 'deploy:file'];
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
			notify: false,
			open: true,
			port: port,
			ui: false,
			reloadDelay: 500,
			reloadOnRestart: true,
		});

		gulp.watch(path.join(pathSrc, '**/*'), function(vinyl) {
			storage.set('changedFile', vinyl);

			let rootDir = path.dirname(vinyl.path);

			rootDir = path.relative(path.join(process.cwd(), pathSrc), rootDir);

			let taskArray = ['deploy:file'];

			if (!fullDeploy && storage.get('deployed')) {
				taskArray = getTaskArray(rootDir, []);
			}

			taskArray.push(clearChangedFile);

			runSequence.apply(this, taskArray);
		});
	}

	function startWatchSocket() {
		let watchSocket = new WatchSocket({
			webBundleDir: webBundleDirName,
			deploymentStrategy: deploymentStrategy,
			dockerContainerName: dockerContainerName,
			dockerThemePath: dockerThemePath,
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
