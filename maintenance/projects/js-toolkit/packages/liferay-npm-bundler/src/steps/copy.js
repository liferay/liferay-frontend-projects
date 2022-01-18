/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import * as gl from 'liferay-npm-build-tools-common/lib/globs';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import * as log from '../log';
import manifest from '../manifest';
import report from '../report';
import {findFiles, getDestDir, runPlugins} from './util';

/**
 * Copy root and dependency packages to output directory.
 * @param {PkgDesc} rootPkg the root package descriptor
 * @param {Array<PkgDesc>} depPkgs dependency package descriptors
 * @return {Promise}
 */
export default function copyPackages(rootPkg, depPkgs) {
	const pkgs = [rootPkg, ...depPkgs];

	return Promise.all(pkgs.map((srcPkg) => copyPackage(srcPkg))).then(() =>
		log.debug(`Copied ${pkgs.filter((pkg) => !pkg.clean).length} packages`)
	);
}

/**
 *
 * @param {PkgDesc} srcPkg
 * @return {Promise}
 */
function copyPackage(srcPkg) {
	const destPkg = srcPkg.clone({
		dir: getDestDir(srcPkg),
	});

	if (!manifest.isOutdated(destPkg)) {
		return Promise.resolve();
	}

	log.debug(`Copying package '${srcPkg.id}'...`);

	srcPkg.clean = false;

	const srcPkgRelPaths = srcPkg.isRoot
		? ['package.json']
		: findFiles(
				project.dir.join(srcPkg.dir).asNative,
				gl.prefix(`${project.dir.asPosix}/${srcPkg.dir.asPosix}/`, [
					`**/*`,
					`!node_modules/**/*`,
				])
		  );

	const srcPkgRelPathsToCopy = srcPkg.isRoot
		? srcPkgRelPaths
		: runCopyPlugins(
				srcPkg,
				destPkg,
				findFiles(
					project.dir.join(srcPkg.dir).asNative,
					gl.prefix(`${project.dir.asPosix}/${srcPkg.dir.asPosix}/`, [
						`**/*`,
						`!node_modules/**/*`,
						...gl.negate(project.copy.getExclusions(srcPkg)),
					])
				)
		  );

	report.packageCopy(srcPkg, srcPkgRelPaths, srcPkgRelPathsToCopy);

	if (!srcPkgRelPathsToCopy.length) {
		srcPkg.clean = true;
	}

	return Promise.all(
		srcPkgRelPathsToCopy.map((srcPkgRelPath) =>
			copyFile(srcPkg, destPkg, srcPkgRelPath)
		)
	);
}

/**
 * Run liferay-nmp-bundler copy plugins on a specified package.
 * @param {PkgDesc} srcPkg the source package descriptor
 * @param {PkgDesc} destPkg the target package descriptor
 * @param {Array<string>} srcPkgRelPaths the files to be processed (relative to
 * 							`srcPkg.dir`)
 * @return {Array<string>} the filtered files
 */
function runCopyPlugins(srcPkg, destPkg, srcPkgRelPaths) {
	const state = runPlugins(
		project.copy.getPluginDescriptors(destPkg),
		srcPkg,
		destPkg,
		{
			files: srcPkgRelPaths,
		},
		(plugin, log) => {
			report.packageProcessBundlerPlugin('copy', destPkg, plugin, log);
		}
	);

	return state.files;
}

/**
 *
 * @param {PkgDesc} srcPkg
 * @param {PkgDesc} destPkg
 * @param {string} srcPkgRelPath
 * @return {Promise}
 */
function copyFile(srcPkg, destPkg, srcPkgRelPath) {
	const absSrcFilePath = project.dir.join(srcPkg.dir, srcPkgRelPath).asNative;
	const absDestFilePath = project.dir.join(destPkg.dir, srcPkgRelPath)
		.asNative;

	return fs
		.mkdirp(path.dirname(absDestFilePath))
		.then(() => fs.copyFile(absSrcFilePath, absDestFilePath));
}
