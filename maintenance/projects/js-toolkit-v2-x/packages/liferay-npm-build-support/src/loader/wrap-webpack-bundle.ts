/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	BundlerLoaderContext,
	BundlerLoaderReturn,
} from 'liferay-npm-build-tools-common/lib/api/loaders';
import * as babelUtil from 'liferay-npm-build-tools-common/lib/babel-util';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import readJsonSync from 'read-json-sync';

import {removeWebpackHash} from './util';

/** Configuration options for `wrap-webpack-bundler` loader */
export interface Options {

	/** Whether to use webpack hashes in file names to compute module names */
	honorWebpackHash?: boolean;

	/** A prefix to remove from file paths when computing the module name */
	removePrefix?: string;
}

/**
 * A loader that wraps JavaScript files into a `Liferay.Loader.define()` call.
 *
 * @remarks
 * The loader leaves the JavaScript content untouched, just wrapping it in a
 * define call.
 *
 * The name of the module is inferred from the project relative file path
 * optionally removing the configured `removePrefix`.
 *
 * If `honorWebpackHash` is set to `true` and the file name contains a webpack
 * hash, it is used to compute the module name. The default value of
 * `honorWebpackHash` is false.
 *
 * @deprecated Use the loader from @liferay/portal-adapt-base instead
 */
export default function (
	context: BundlerLoaderContext,
	options: Options
): BundlerLoaderReturn {
	const {content, filePath, log} = context;
	const {honorWebpackHash = false, removePrefix = ''} = options;

	const moduleName = getModuleName(
		honorWebpackHash ? filePath : removeWebpackHash(filePath),
		removePrefix
	);

	log.info(
		'wrap-webpack-bundle',
		`Wrapped bundle with module name '${moduleName}'`
	);

	return `
Liferay.Loader.define(
	'${moduleName}',
	['module'],
	function(module) {
		module.exports = function(_LIFERAY_PARAMS_, _ADAPT_RT_) {
			${content}
		}
	}
);`;
}

/**
 * Compute the module name associated to a project relative file path removing
 * the `removePrefix` before.
 */
function getModuleName(prjRelfilePath: string, removePrefix: string): string {
	const absFile = new FilePath(prjRelfilePath);
	const pkgDir = new FilePath(babelUtil.getPackageDir(prjRelfilePath));

	let moduleName: string = pkgDir.relative(absFile).asPosix;

	if (moduleName.toLowerCase().endsWith('.js')) {
		moduleName = moduleName.substring(0, moduleName.length - 3);
	}

	if (moduleName.startsWith(removePrefix)) {
		moduleName = moduleName.substring(removePrefix.length);
	}

	const pkgJson = readJsonSync(pkgDir.join('package.json').asNative);

	return `${pkgJson.name}@${pkgJson.version}/${moduleName}`;
}
