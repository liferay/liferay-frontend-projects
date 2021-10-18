/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath} from '@liferay/js-toolkit-core';
import fs from 'fs';
import {
	BundlerLoaderContext,
	BundlerLoaderReturn,
} from 'liferay-npm-build-tools-common/lib/api/loaders';
import * as babelUtil from 'liferay-npm-build-tools-common/lib/babel-util';

import removeWebpackHash from '../util/removeWebpackHash';

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
 * The name of the module is inferred from the project relative file path.
 */
export default function wrapWebpackBundle(
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

	let moduleName = pkgDir.relative(absFile).asPosix;

	if (moduleName.toLowerCase().endsWith('.js')) {
		moduleName = moduleName.substring(0, moduleName.length - 3);
	}

	if (moduleName.startsWith(removePrefix)) {
		moduleName = moduleName.substring(removePrefix.length);
	}

	const pkgJson = JSON.parse(
		fs.readFileSync(pkgDir.join('package.json').asNative, 'utf8')
	);

	return `${pkgJson.name}@${pkgJson.version}/${moduleName}`;
}
