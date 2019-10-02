/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	BundlerLoaderContext,
	BundlerLoaderReturn,
} from 'liferay-npm-build-tools-common/lib/api/loaders';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import * as pkgs from 'liferay-npm-build-tools-common/lib/packages';
import readJsonSync from 'read-json-sync';

export default function(
	{content, filePath, log}: BundlerLoaderContext,
	{removePrefix}: {removePrefix: string}
): BundlerLoaderReturn {
	const moduleName = getModuleName(filePath, removePrefix);

	log.info(
		'wrap-webpack-bundle',
		`Wrapped bundle with module name '${moduleName}'`
	);

	return `
Liferay.Loader.define(
	'${moduleName}',
	['module'],
	function(module) {
		module.exports = function(_LIFERAY_PARAMS_) {
			${content}
		}
	}
);`;
}

function getModuleName(prjRelfilePath: string, removePrefix: string): string {
	const absFile = new FilePath(prjRelfilePath);
	const pkgDir = new FilePath(pkgs.getPackageDir(prjRelfilePath));

	let moduleName: string = pkgDir.relative(absFile).asPosix;

	if (moduleName.toLowerCase().endsWith('.js')) {
		moduleName = moduleName.substring(0, moduleName.length - 3);
	}

	const chunkIndex = moduleName.lastIndexOf('.');

	if (!Number.isNaN(parseInt(moduleName.substring(chunkIndex + 1), 16))) {
		moduleName = moduleName.substring(0, chunkIndex);
	}

	if (moduleName.startsWith(removePrefix)) {
		moduleName = moduleName.substring(removePrefix.length);
	}

	const pkgJson = readJsonSync(pkgDir.join('package.json').asNative);

	return `${pkgJson.name}@${pkgJson.version}/${moduleName}`;
}
