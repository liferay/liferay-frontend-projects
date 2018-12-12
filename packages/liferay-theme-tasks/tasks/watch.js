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
const EXPLODED_BUILD_DIR_NAME = '.web_bundle_build';

module.exports = function(options) {
	// Get things from options
	const {
		argv,
		distName,
		gogoShellConfig,
		gulp,
		pathBuild,
		pathSrc,
	} = options;

	// Initialize global things
	const {storage} = gulp;
	const connectParams = _.assign({}, CONNECT_PARAMS, gogoShellConfig);
	const fullDeploy = argv.full || argv.f;
	const runSequence = require('run-sequence').use(gulp);

	// Get config from liferay-theme.json
	const url = argv.url || storage.get('url');
	const appServerPath = storage.get('appServerPath');
	const deploymentStrategy = storage.get('deploymentStrategy');
	const dockerContainerName = storage.get('dockerContainerName');
	const pluginName = storage.get('pluginName') || '';

	// Calculate some values
	const explodedBuildDir = path.join(process.cwd(), EXPLODED_BUILD_DIR_NAME);
	const dockerThemePath = path.posix.join('/tmp', pluginName);
	const dockerBundleDirPath = path.posix.join(
		dockerThemePath,
		EXPLODED_BUILD_DIR_NAME
	);
	const dockerPath =
		deploymentStrategy == DEPLOYMENT_STRATEGIES.DOCKER_CONTAINER
			? path.posix
			: path;

	// Share browserSync with deploy task
	gulp.browserSync = browserSync;

	/**
	 * Start watching project folder
	 */
	gulp.task('watch', function() {
		options.watching = true;

		storage.set('appServerPathPlugin', explodedBuildDir);

		// Get tasks array
		let taskArray = getCleanTaskArray(deploymentStrategy);

		// Push final task that deploys the theme and starts live reloads
		taskArray.push(err => {
			if (err) {
				throw err;
			}

			getWatchSocket()
				.then(watchSocket => watchSocket.deploy())
				.then(() => {
					storage.set('webBundleDir', 'watching');

					return portfinder.getPortPromise();
				})
				.then(port => startWatch(port, url));
		});

		// Run tasks in sequence
		runSequence.apply(this, taskArray);
	});

	/**
	 * Clean the exploded build dir
	 */
	gulp.task('watch:clean', function(cb) {
		del([explodedBuildDir], cb);
	});

	/**
	 * Uninstall bundled WAR file from OSGi
	 */
	gulp.task('watch:osgi:clean', function(cb) {
		getWatchSocket()
			.then(function(watchSocket) {
				const warPath = dockerPath.join(
					appServerPath,
					'..',
					'osgi',
					'war',
					distName + '.war'
				);

				return watchSocket.uninstall(warPath, distName);
			})
			.then(cb);
	});

	/**
	 * Deploy bundled WAR file to OSGi
	 */
	gulp.task('watch:osgi:reinstall', function(cb) {
		getWatchSocket()
			.then(watchSocket => watchSocket.deploy())
			.then(cb);
	});

	/**
	 * Clean the remote exploded build dir in docker
	 */
	gulp.task('watch:docker:clean', function(cb) {
		themeUtil.dockerExec(
			dockerContainerName,
			'rm -rf ' + dockerBundleDirPath
		);

		cb();
	});

	/**
	 * Copy the exploded build dir to docker
	 */
	gulp.task('watch:docker:copy', function(cb) {
		themeUtil.dockerExec(
			dockerContainerName,
			'mkdir -p ' + dockerBundleDirPath
		);

		themeUtil.dockerCopy(
			dockerContainerName,
			explodedBuildDir,
			dockerBundleDirPath,
			cb
		);
	});

	/**
	 * Copy output files to exploded build dir
	 */
	gulp.task('watch:setup', function() {
		return gulp
			.src(path.join(pathBuild, '**/*'))
			.pipe(gulp.dest(explodedBuildDir));
	});

	/**
	 * Cleanup watch machinery
	 */
	gulp.task('watch:teardown', function(cb) {
		storage.set('webBundleDir');

		let taskArray = getTeardownTaskArray();

		taskArray.push(cb);

		runSequence.apply(this, taskArray);
	});

	/**
	 * Start live reload server and watch for changes in project files.
	 * @param {int} port
	 * @param {string} url
	 */
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
				taskArray = getBuildTaskArray(rootDir, []);
			}

			taskArray.push(clearChangedFile);

			runSequence.apply(this, taskArray);
		});
	}

	function clearChangedFile() {
		storage.set('changedFile');
	}

	function getTeardownTaskArray() {
		let taskArray = ['watch:clean'];

		if (deploymentStrategy === DEPLOYMENT_STRATEGIES.DOCKER_CONTAINER) {
			taskArray.push('watch:docker:clean');
		}

		return taskArray;
	}

	function getBuildTaskArray(rootDir, defaultTaskArray) {
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

	function getCleanTaskArray(deploymentStrategy) {
		switch (deploymentStrategy) {
		case DEPLOYMENT_STRATEGIES.LOCAL_APP_SERVER:
			return [
				'build',
				'watch:clean',
				'watch:osgi:clean',
				'watch:setup',
			];

		case DEPLOYMENT_STRATEGIES.DOCKER_CONTAINER:
			return [
				'build',
				'watch:clean',
				'watch:docker:clean',
				'watch:osgi:clean',
				'watch:setup',
				'watch:docker:copy',
			];
		}
	}

	function getWatchSocket() {
		return new Promise((resolve, reject) => {
			let watchSocket = getWatchSocket.watchSocket;

			if (!watchSocket) {
				watchSocket = new WatchSocket({
					webBundleDir: EXPLODED_BUILD_DIR_NAME,
					deploymentStrategy: deploymentStrategy,
					dockerContainerName: dockerContainerName,
					dockerThemePath: dockerThemePath,
				});

				watchSocket.on('error', function(err) {
					if (
						err.code === 'ECONNREFUSED' ||
						err.errno === 'ECONNREFUSED'
					) {
						log(
							colors.yellow(
								'Cannot connect to gogo shell. Please ensure local Liferay instance is running.'
							)
						);
					}
				});

				watchSocket
					.connect(connectParams)
					.then(() => {
						getWatchSocket.watchSocket = watchSocket;

						resolve(watchSocket);
					})
					.catch(reject);
			} else {
				resolve(watchSocket);
			}
		});
	}
};
