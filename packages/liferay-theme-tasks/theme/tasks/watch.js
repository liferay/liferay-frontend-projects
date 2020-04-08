/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const chalk = require('chalk');
const fs = require('fs-extra');
const watch = require('gulp-watch');
const http = require('http');
const httpProxy = require('http-proxy');
const passes = require('http-proxy/lib/http-proxy/passes/web-outgoing');
const opn = require('opn');
const path = require('path');
const portfinder = require('portfinder');
const tinylr = require('tiny-lr');
const url = require('url');
const util = require('util');

const project = require('../../lib/project');
const themeUtil = require('../../lib/util');

const PASSES = Object.values(passes);

const accessAsync = util.promisify(fs.access);

const DEPLOYMENT_STRATEGIES = themeUtil.DEPLOYMENT_STRATEGIES;
const EXPLODED_BUILD_DIR_NAME = '.web_bundle_build';
const MIME_TYPES = {
	'.css': 'text/css',
	'.ico': 'image/x-icon',
	'.js': 'text/javascript',
	'.map': 'application/json',
	'.svg': 'image/svg+xml',
};

/**
 * Splits a path into an array of path components.
 */
function getPathComponents(pathString) {
	return pathString.split(path.sep);
}

/**
 * Give a path to a resource such as "src/css/partials/_header.scss",
 * returns the the name of the child directory under "src/" containing
 * the resource (eg. "css").
 */
function getResourceDir(pathString, pathSrc) {
	const relativePath = path.relative(pathSrc.asNative, pathString);
	return getPathComponents(relativePath)[0];
}

/**
 * Returns a Promise that resolves to `true` if `file` exists and `false`
 * otherwise.
 */
function isReadable(file) {
	return accessAsync(file, fs.constants.R_OK).then(
		() => true,
		() => false
	);
}

module.exports = function() {
	const {gulp, options, store} = project;
	const {runSequence} = gulp;
	const {argv, distName, pathBuild, pathSrc, resourcePrefix} = options;
	const {deploymentStrategy, dockerContainerName} = store;

	// Calculate some values
	const proxyUrl = argv.url || store.url;
	const pluginName = store.pluginName || '';
	const explodedBuildDir = path.join(project.dir, EXPLODED_BUILD_DIR_NAME);
	const dockerThemePath = path.posix.join('/tmp', pluginName);
	const dockerBundleDirPath = path.posix.join(
		dockerThemePath,
		EXPLODED_BUILD_DIR_NAME
	);

	/**
	 * Start watching project folder
	 */
	gulp.task('watch', () => {
		project.watching = true;

		// Get tasks array
		const taskArray = getCleanTaskArray(deploymentStrategy);

		// Push final task that deploys the theme and starts live reloads
		taskArray.push(err => {
			if (err) {
				throw err;
			}

			Promise.all([
				portfinder.getPortPromise({port: 9080}),
				portfinder.getPortPromise({port: 35729}),
			]).then(([httpPort, tinylrPort]) => {
				store.webBundleDir = 'watching';
				startWatch(httpPort, tinylrPort, proxyUrl);
			});
		});

		// Run tasks in sequence
		runSequence(...taskArray);
	});

	/**
	 * Clean the exploded build dir
	 */
	gulp.task('watch:clean', cb => {
		fs.removeSync(explodedBuildDir);
		cb();
	});

	/**
	 * Clean the remote exploded build dir in docker
	 */
	gulp.task('watch:docker:clean', cb => {
		themeUtil.dockerExec(
			dockerContainerName,
			'rm -rf ' + dockerBundleDirPath
		);

		cb();
	});

	/**
	 * Copy the exploded build dir to docker
	 */
	gulp.task('watch:docker:copy', cb => {
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
	gulp.task('watch:setup', () => {
		return gulp
			.src(pathBuild.join('**', '*').asPosix)
			.pipe(gulp.dest(explodedBuildDir));
	});

	/**
	 * Cleanup watch machinery
	 */
	gulp.task('watch:teardown', cb => {
		store.webBundleDir = undefined;

		const taskArray = getTeardownTaskArray();

		taskArray.push(cb);

		runSequence(...taskArray);
	});

	let livereload;

	gulp.task('watch:reload', cb => {
		const {changedFile} = store;
		const srcPath = path.relative(project.dir, changedFile.path);
		const dstPath = srcPath.replace(/^src\//, '');
		const urlPath = `${resourcePrefix}/${distName}/${dstPath}`;

		livereload.changed({
			body: {
				files: [urlPath],
			},
		});
		cb();
	});

	/**
	 * Start live reload server and watch for changes in project files.
	 * @param {int} httpPort   The port for the http server
	 * @param {int} tinylrPort The port for the livereload server
	 * @param {string} proxyUrl     The proxy target URL
	 */
	function startWatch(httpPort, tinylrPort, proxyUrl) {
		clearChangedFile();

		const themePattern = new RegExp(
			`(?!.*.(ftl|tpl|vm))(${resourcePrefix}/${distName}/)(.*)`
		);

		const livereloadTag = `<script src="http://localhost:${tinylrPort}/livereload.js"></script>`;
		livereload = tinylr();
		livereload.server.on('error', err => {
			// eslint-disable-next-line no-console
			console.error(err);
		});
		livereload.listen(tinylrPort);

		const proxy = httpProxy.createServer();

		proxy.on('proxyReq', (proxyReq, _req, _res, _options) => {
			// Disable compression because it complicates the task of appending
			// our livereload tag.
			proxyReq.setHeader('Accept-Encoding', 'identity');
		});

		proxy.on('proxyRes', (proxyRes, req, res) => {
			// Make sure that "web passes" (eg. header setting and such) still
			// happen even though we are in "selfHandleResponse" mode.
			// See: https://github.com/nodejitsu/node-http-proxy/issues/1263
			for (let i = 0; i < PASSES.length; i++) {
				if (PASSES[i](req, res, proxyRes, project.options)) {
					break;
				}
			}

			proxyRes.on('data', data => {
				res.write(data);
			});

			proxyRes.on('end', () => {
				const appendLivereloadTag =
					req.headers.accept &&
					req.headers.accept.includes('text/html') &&
					(res.getHeader('Content-Type') || '').indexOf(
						'text/html'
					) === 0;

				if (appendLivereloadTag) {
					res.end(livereloadTag);
				} else {
					res.end();
				}
			});
		});

		proxy.on('error', err => {
			// eslint-disable-next-line no-console
			console.error(err);
		});

		http.createServer((req, res) => {
			const dispatchToProxy = () =>
				proxy.web(req, res, {
					selfHandleResponse: true,
					target: proxyUrl,
				});

			const requestUrl = url.parse(req.url);

			const match = themePattern.exec(requestUrl.pathname);
			if (match) {
				const filepath = path.resolve('build', match[3]);
				const ext = path.extname(filepath);

				isReadable(filepath).then(exists => {
					if (exists) {
						if (MIME_TYPES[ext]) {
							res.setHeader('Content-Type', MIME_TYPES[ext]);
						}

						fs.createReadStream(filepath)
							.on('error', err => {
								// eslint-disable-next-line no-console
								console.error(err);
							})
							.pipe(res);
					} else {
						dispatchToProxy();
					}
				});
			} else {
				dispatchToProxy();
			}
		}).listen(httpPort, () => {
			const url = `http://localhost:${httpPort}/`;
			const messages = [
				`Watch mode is now active at: ${url}`,
				`Proxying: ${proxyUrl}`,
			];
			const width = messages.reduce((max, line) => {
				return Math.max(line.length, max);
			}, 0);
			const ruler = '-'.repeat(width);

			// eslint-disable-next-line no-console
			console.log(
				'\n' + chalk.yellow([ruler, ...messages, ruler].join('\n'))
			);

			opn(url);
		});

		watch(path.join(pathSrc.asPosix, '**', '*'), vinyl => {
			store.changedFile = vinyl;

			const resourceDir = getResourceDir(vinyl.path, pathSrc);

			const taskArray = getBuildTaskArray(resourceDir);

			taskArray.push(clearChangedFile);

			runSequence(...taskArray);
		});
	}

	function clearChangedFile() {
		store.changedFile = undefined;
	}

	function getTeardownTaskArray() {
		const taskArray = ['watch:clean'];

		if (deploymentStrategy === DEPLOYMENT_STRATEGIES.DOCKER_CONTAINER) {
			taskArray.push('watch:docker:clean');
		}

		return taskArray;
	}

	function getBuildTaskArray(resourceDir) {
		let taskArray;

		if (resourceDir === 'css') {
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
				'watch:reload',
			];
		} else if (resourceDir === 'js') {
			taskArray = ['build:src', 'watch:reload'];
		} else {
			taskArray = ['deploy', 'watch:reload'];
		}

		return taskArray;
	}

	function getCleanTaskArray(deploymentStrategy) {
		switch (deploymentStrategy) {
			case DEPLOYMENT_STRATEGIES.LOCAL_APP_SERVER:
				return ['deploy', 'watch:clean', 'watch:setup'];

			case DEPLOYMENT_STRATEGIES.DOCKER_CONTAINER:
				return [
					'deploy',
					'watch:clean',
					'watch:docker:clean',
					'watch:setup',
					'watch:docker:copy',
				];

			default:
				return [];
		}
	}
};
