/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const {FilePath} = require('@liferay/js-toolkit-core');
const fs = require('fs');
const babelUtil = require('liferay-npm-build-tools-common/lib/babel-util');

const removeWebpackHash = require('../util/removeWebpackHash');

/**
 * A loader that wraps JavaScript files into a `Liferay.Loader.define()` call.
 *
 * @remarks
 * The loader leaves the JavaScript content untouched, just wrapping it in a
 * define call.
 *
 * The name of the module is inferred from the project relative file path.
 *
 * Valid options are:
 *
 *   - removePrefix: optional prefix to remove from file paths
 *   - honorWebpackHash: optional flag to maintain webpack hashes in file names
 *
 * Both options may affect the module name because they transform the file name.
 */
module.exports = function wrapWebpackBundle(context, options) {
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
};

/**
 * Compute the module name associated to a project relative file path removing
 * the `removePrefix` before.
 */
function getModuleName(prjRelfilePath, removePrefix) {
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
