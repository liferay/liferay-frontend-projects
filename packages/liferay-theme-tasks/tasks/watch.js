'use strict';

const del = require('del');
const path = require('path');
const themeUtil = require('../lib/util');
const DEPLOYMENT_STRATEGIES = themeUtil.DEPLOYMENT_STRATEGIES;

const portfinder = require('portfinder');
portfinder.basePort = 9080;

const TINYLR_PORT = 35729;
const fs = require('fs');
const http = require('http');
const httpProxy = require('http-proxy');
const tinylr = require('tiny-lr');

const EXPLODED_BUILD_DIR_NAME = '.web_bundle_build';

module.exports = function(options) {
	// Get things from options
	const {argv, distName, gogoShellConfig, gulp, pathBuild, pathSrc} = options;

	// Initialize global things
	const {storage} = gulp;
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

	/**
	 * Start watching project folder
	 */
	gulp.task('watch', function() {
		options.watching = true;

		storage.set('appServerPathPlugin', explodedBuildDir);

		// Get tasks array
		const taskArray = getCleanTaskArray(deploymentStrategy);

		// Push final task that deploys the theme and starts live reloads
		taskArray.push(err => {
			if (err) {
				throw err;
			}

			portfinder.getPortPromise()
				.then(port => {
					storage.set('webBundleDir', 'watching');

					startWatch(port, url);
				});
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
		cb();
	});

	/**
	 * Deploy bundled WAR file to OSGi
	 */
	gulp.task('watch:osgi:reinstall', function(cb) {
		cb();
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

		const taskArray = getTeardownTaskArray();

		taskArray.push(cb);

		runSequence.apply(this, taskArray);
	});

	gulp.task('watch:reload', function(cb) {
		livereload.changed({
			body: {
				files: ['/o/test-theme/css/main.css'],
			},
		});
		cb();
	});


	let livereload;

	/**
	 * Start live reload server and watch for changes in project files.
	 * @param {int} port
	 * @param {string} url
	 */
	function startWatch(port, url) {
		clearChangedFile();

		const cssRegExp = new RegExp('/o/' + options.distName + '/css/main.css\\?');

		livereload = tinylr();
		livereload.server.on('error', err => {
			console.error(err);
		});
		livereload.listen(TINYLR_PORT);

		const proxy = httpProxy.createServer();

		http.createServer((req, res) => {
			proxy.web(req, res, {
				target: url
			});

			if (req.url === '/') {
				// Inject the livereload script
				res.write(`<script>document.write('<script src=\"http://localhost:${TINYLR_PORT}/livereload.js?snipver=1\"></' + 'script>')</script>`);
			}

			if (req.url.match(cssRegExp)) {
				const cssPath = path.resolve(process.cwd(), 'build', 'css', 'main.css');
				fs.createReadStream(cssPath)
					.on('error', err => {
						console.error('Stream error\n', err);
					})
					.pipe(res);
			}
		}).listen(port, function() {
			console.log(`Proxy server listening on ${port}`);
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
		const taskArray = ['watch:clean'];

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
				'watch:reload',
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

			default:
				return [];
		}
	}
};
