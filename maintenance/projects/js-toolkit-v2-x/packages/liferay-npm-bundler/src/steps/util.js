/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import globby from 'globby';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import {getPackageTargetDir} from 'liferay-npm-build-tools-common/lib/packages';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';
import readJsonSync from 'read-json-sync';

/**
 * Perform a glob search of files and return their paths referenced to
 * `baseDir` without leading `./`.
 *
 * Note that the globs are not altered in any way and may even point to files
 * outside of the project directory.
 *
 * @param {string} baseDirPath a native directory path
 * @param {Array<string>} globs globs in `globby` format (may include `.` and
 * 				`..` but must be in POSIX format, i.e.: use `/` path separator)
 * @return {Array<string>} an array containing native file paths relative to
 * 				`baseDirPath`
 */
export function findFiles(baseDirPath, globs) {
	let files = globby
		.sync(globs, {
			absolute: true,
			onlyFiles: true,
			followSymbolicLinks: false,
		})
		.map((absPath) => path.relative(baseDirPath, absPath))
		.map((baseDirRelPath) => new FilePath(baseDirRelPath, {posix: true}));

	files = files.map((file) => file.asNative);

	return files;
}

/**
 * Get the project relative path to the destination directory of a package.
 * @param {PkgDesc} pkg
 * @return {string} native path to destination directory of package
 */
export function getDestDir(pkg) {
	return pkg.isRoot
		? project.dir.join(project.buildDir).asNative
		: project.buildDir.join(
				'node_modules',
				getPackageTargetDir(pkg.name, pkg.version)
		  ).asNative;
}

/**
 * Iterate through the elements of an array applying an async process serially
 * to each one of them.
 * @param {Array} values array of values to be iterated
 * @param {function} asyncProcess the async process (that returns a Promise) to
 *        be executed on each value
 * @return {Promise} a Promise that is resolved as soon as the iteration
 *         finishes
 */
export function iterateSerially(values, asyncProcess) {
	if (!values.length) {
		return Promise.resolve();
	}

	return asyncProcess(values[0]).then(() =>
		iterateSerially(values.slice(1), asyncProcess)
	);
}

/**
 * Run an async process over a series of items, applying the process chunk by
 * chunk.
 * This is especially useful to maintain an upper bound on the maximum number of
 * open files so as to avoid EMFILE errors.
 * @param {Array<*>} items
 * @param {number} chunkSize
 * @param {number} chunkIndex
 * @param {function} callback receives an item to process and returns a Promise
 * @return {Promise}
 */
export function runInChunks(items, chunkSize, chunkIndex, callback) {
	const chunksCount = Math.floor((items.length + chunkSize - 1) / chunkSize);

	const chunk = items.slice(
		chunkIndex * chunkSize,
		Math.min(items.length, (chunkIndex + 1) * chunkSize)
	);

	return Promise.all(chunk.map((item) => callback(item))).then(() => {
		chunkIndex++;

		if (chunkIndex < chunksCount) {
			return runInChunks(items, chunkSize, chunkIndex, callback);
		}
	});
}

/**
 * Run a liferay-npm-bundler plugin
 * @param  {Array} plugins list of plugin descriptors (with name, config and run fields)
 * @param  {PkgDesc} srcPkg source package descriptor
 * @param  {PkgDesc} destPkg processed package descriptor
 * @param  {Object} state state to pass to plugins
 * @param  {function} callback a callback function to invoke once per plugin with the used plugin and PluginLogger
 * @return {Object} the state object
 */
export function runPlugins(plugins, srcPkg, destPkg, state, callback) {
	plugins.forEach((plugin) => {
		const params = {
			config: plugin.config,
			log: new PluginLogger(),
			rootPkgJson: readJsonSync('package.json'),
			globalConfig: project.globalConfig,

			pkg: destPkg.clone(),

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
