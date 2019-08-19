/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babel from 'babel-core';
import fs from 'fs-extra';
import globby from 'globby';
import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import * as gl from 'liferay-npm-build-tools-common/lib/globs';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import path from 'path';
import readJsonSync from 'read-json-sync';

import * as config from './config';
import * as log from './log';
import manifest from './manifest';
import report from './report';
import {loadSourceMap} from './util';
import project from 'liferay-npm-build-tools-common/lib/project';

/**
 * Run configured rules.
 * @param {String} outputDir the output directory path
 * @return {Promise}
 */
export function runRules(outputDir) {
	const filePaths = globby.sync(`${outputDir}/**/*`);

	return Promise.all(
		filePaths
			.filter(filePath => !fs.statSync(filePath).isDirectory())
			.map(filePath => {
				filePath = path.resolve(filePath);

				const context = {
					content: fs.readFileSync(filePath, 'utf-8').toString(),
					filePath,
					extraArtifacts: {},
					log: new PluginLogger(),
				};

				const loaders = project.rules.loadersForFile(filePath);

				return runLoaders(loaders, 0, context).then(() => {
					fs.writeFileSync(filePath, context.content);

					Object.entries(context.extraArtifacts).forEach(
						([filePath, content]) =>
							fs.writeFileSync(filePath, content)
					);
				});
			})
	);
}

function runLoaders(loaders, firstLoaderIndex, context) {
	if (firstLoaderIndex >= loaders.length) {
		return Promise.resolve(context.content);
	}

	const loader = loaders[firstLoaderIndex];

	let result;

	try {
		result = loader.exec(context, loader.options);
	} catch (err) {
		err.message = `Loader '${loader.use}' failed: ${err.message}`;
		throw err;
	}

	return Promise.resolve(result).then(content => {
		if (content !== undefined) {
			context = Object.assign(context, {content});
		}

		return runLoaders(loaders, firstLoaderIndex + 1, context);
	});
}

/**
 * Run Babel on a package.
 * @param {PkgDesc} pkg the package descriptor
 * @param {Array} ignore array of output-relative file paths to avoid when processing with Babel
 * @return {Promise} a Promise fulfilled when the process has been finished
 */
export function runBabel(pkg, {ignore = []} = {}) {
	// Make a copy of the package's Babel configuration
	const babelConfig = cloneObject(config.babel.getConfig(pkg));

	// Tune babel config
	babelConfig.babelrc = false;
	babelConfig.only = '**/*';
	if (babelConfig.sourceMaps === undefined) {
		babelConfig.sourceMaps = true;
	}

	// Report a copy of the package's Babel configuration before loading plugins
	report.packageProcessBabelConfig(pkg, cloneObject(babelConfig));

	// Intercept presets and plugins to load them from here
	babelConfig.plugins = config.babel.loadBabelPlugins(
		babelConfig.presets || [],
		babelConfig.plugins || []
	);
	babelConfig.presets = [];

	// Determine files to process
	const globs = [`${pkg.dir}/**/*.js`]
		.concat(gl.negate(gl.prefix(`${pkg.dir}/`, ignore)))
		.concat([`!${pkg.dir}/node_modules/**`]);

	// Run babel through them
	const filePaths = globby.sync(globs);

	return processBabelFiles(filePaths, 0, pkg, babelConfig);
}

/**
 * Recursively process JavaScript files with Babel chunk by chunk, to maintain
 * an upper bound on the maximum number of open files so as to avoid EMFILE
 * errors.
 * @param {Array<string>} filePaths list of files to process
 * @param {number} chunkIndex
 * @param {object} pkg
 * @param {object} babelConfig
 * @return {Promise}
 */
function processBabelFiles(filePaths, chunkIndex, pkg, babelConfig) {
	const chunkSize = config.bundler.getMaxParallelFiles();

	const chunksCount = Math.floor(
		(filePaths.length + chunkSize - 1) / chunkSize
	);

	const filePathsChunk = filePaths.slice(
		chunkIndex * chunkSize,
		Math.min(filePaths.length, (chunkIndex + 1) * chunkSize)
	);

	const promises = filePathsChunk.map(
		filePath =>
			new Promise(resolve => {
				const logger = new PluginLogger();

				babelIpc.set(filePath, {
					log: logger,
					manifest,
					rootPkgJson: readJsonSync('package.json'),
					globalConfig: cloneObject(config.getGlobalConfig()),
				});

				const packageFilePath = filePath.substring(
					path.resolve(pkg.dir).length + 1
				);

				babel.transformFile(
					filePath,
					Object.assign(
						{
							filenameRelative: filePath,
							inputSourceMap: loadSourceMap(filePath),
						},
						babelConfig
					),
					(err, result) => {
						// Generate and/or log results
						if (err) {
							log.error(
								'Babel failed processing',
								`${pkg.id}/${packageFilePath}:`,
								'it will be copied verbatim (see report file for more info)'
							);

							logger.error('babel', err);

							report.warn(
								'Babel failed processing some .js files: ' +
									'check details of Babel transformations for more info.',
								{unique: true}
							);
						} else {
							const fileName = path.basename(filePath);

							fs.writeFileSync(
								filePath,
								`${result.code}\n` +
									`//# sourceMappingURL=${fileName}.map`
							);

							fs.writeFileSync(
								`${filePath}.map`,
								JSON.stringify(result.map)
							);
						}

						// Report result of babel run
						report.packageProcessBabelRun(
							pkg,
							packageFilePath,
							logger
						);

						if (logger.errorsPresent) {
							report.warn(
								'There are errors for some of the ' +
									'Babel plugins: please check details ' +
									'of Babel transformations.',
								{unique: true}
							);
						} else if (logger.warnsPresent) {
							report.warn(
								'There are warnings for some of the ' +
									'Babel plugins: please check details' +
									'of Babel transformations.',
								{unique: true}
							);
						}

						// Get rid of Babel IPC values
						babelIpc.clear(filePath);

						// Resolve promise
						resolve();
					}
				);
			})
	);

	return Promise.all(promises).then(() => {
		chunkIndex++;

		if (chunkIndex < chunksCount) {
			return processBabelFiles(filePaths, chunkIndex, pkg, babelConfig);
		}
	});
}

/**
 * Run liferay-nmp-bundler copy plugins on a specified package.
 * @param {PkgDesc} srcPkg the source package descriptor
 * @param {PkgDesc} pkg the target package descriptor
 * @param {Array<string>} files the files to be processed
 * @return {Array<string>} the filtered files
 */
export function runCopyPlugins(srcPkg, pkg, files) {
	const state = runPlugins(
		config.bundler.getPlugins('copy', pkg),
		srcPkg,
		pkg,
		{
			files,
		},
		(plugin, log) => {
			report.packageProcessBundlerPlugin('copy', pkg, plugin, log);
		}
	);

	return state.files;
}

/**
 * Process an NPM package with the configured liferay-nmp-bundler plugins. This
 * function is called two times (known as phases) per package: one before Babel
 * runs and one after.
 * @param {String} phase 'pre' or 'post' depending on what phase we are in
 * @param {PkgDesc} srcPkg the source package descriptor
 * @param {PkgDesc} pkg the target package descriptor
 * @return {Promise} a Promise fulfilled when the process has been finished
 */
export function runBundlerPlugins(phase, srcPkg, pkg) {
	return new Promise((resolve, reject) => {
		try {
			const state = runPlugins(
				config.bundler.getPlugins(phase, pkg),
				srcPkg,
				pkg,
				{
					pkgJson: readJsonSync(path.join(pkg.dir, 'package.json')),
				},
				(plugin, log) => {
					report.packageProcessBundlerPlugin(phase, pkg, plugin, log);

					if (log.errorsPresent) {
						report.warn(
							'There are errors for some of the ' +
								'liferay-npm-bundler plugins: please check ' +
								'details of bundler transformations.',
							{unique: true}
						);
					} else if (log.warnsPresent) {
						report.warn(
							'There are warnings for some of the ' +
								'liferay-npm-bundler plugins: please check ' +
								'details of bundler transformations.',
							{unique: true}
						);
					}
				}
			);

			fs.writeFileSync(
				path.join(pkg.dir, 'package.json'),
				JSON.stringify(state.pkgJson, '', 2)
			);

			resolve();
		} catch (err) {
			reject(err);
		}
	});
}

/**
 * Run a liferay-npm-bundler plugin
 * @param  {Array} plugins list of plugin descriptors (with name, config and run fields)
 * @param  {PkgDesc} srcPkg source package descriptor
 * @param  {PkgDesc} pkg processed package descriptor
 * @param  {Object} state state to pass to plugins
 * @param  {function} callback a callback function to invoke once per plugin with the used plugin and PluginLogger
 * @return {Object} the state object
 */
function runPlugins(plugins, srcPkg, pkg, state, callback) {
	plugins.forEach(plugin => {
		const params = {
			config: plugin.config,
			log: new PluginLogger(),
			rootPkgJson: readJsonSync('package.json'),
			globalConfig: config.getGlobalConfig(),

			pkg: pkg.clone(),

			source: {
				pkg: srcPkg.clone(),
			},
		};

		plugin.run(params, state);

		if (callback) {
			callback(plugin, params.log);
		}
	});

	return state;
}

/**
 * Clone a value object
 * @param  {Object} object the object to clone
 * @return {Object} a clone of the value object
 */
function cloneObject(object) {
	return JSON.parse(JSON.stringify(object));
}
