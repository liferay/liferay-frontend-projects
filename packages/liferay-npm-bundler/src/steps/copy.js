/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import * as gl from 'liferay-npm-build-tools-common/lib/globs';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import * as config from '../config';
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

	return Promise.all(pkgs.map(srcPkg => copyPackage(srcPkg))).then(() =>
		log.debug(`Copied ${pkgs.filter(pkg => !pkg.clean).length} packages`)
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

	const baseAllFiles = srcPkg.isRoot
		? ['package.json']
		: findFiles(
				path.join(project.dir, srcPkg.dir),
				gl.prefix(`${project.dir}/${srcPkg.dir}/`, [
					`**/*`,
					`!node_modules/**/*`,
				])
		  );

	const baseFilesToCopy = srcPkg.isRoot
		? baseAllFiles
		: runCopyPlugins(
				srcPkg,
				destPkg,
				findFiles(
					path.join(project.dir, srcPkg.dir),
					gl.prefix(`${project.dir}/${srcPkg.dir}/`, [
						`**/*`,
						`!node_modules/**/*`,
						...gl.negate(config.bundler.getExclusions(srcPkg)),
					])
				)
		  );

	report.packageCopy(srcPkg, baseAllFiles, baseFilesToCopy);

	if (baseFilesToCopy.length === 0) {
		srcPkg.clean = true;
	}

	return Promise.all(
		baseFilesToCopy.map(baseFile => copyFile(srcPkg, destPkg, baseFile))
	);
}

/**
 * Run liferay-nmp-bundler copy plugins on a specified package.
 * @param {PkgDesc} srcPkg the source package descriptor
 * @param {PkgDesc} destPkg the target package descriptor
 * @param {Array<string>} prjFiles the files to be processed (relative to
 * 							`project.dir`)
 * @return {Array<string>} the filtered files
 */
function runCopyPlugins(srcPkg, destPkg, prjFiles) {
	const state = runPlugins(
		config.bundler.getPlugins('copy', destPkg),
		srcPkg,
		destPkg,
		{
			files: prjFiles,
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
 * @param {string} baseFile
 * @return {Promise}
 */
function copyFile(srcPkg, destPkg, baseFile) {
	const absSrcFilePath = path.join(project.dir, srcPkg.dir, baseFile);
	const absDestFilePath = path.join(project.dir, destPkg.dir, baseFile);

	return fs
		.mkdirp(path.dirname(absDestFilePath))
		.then(() => fs.copyFile(absSrcFilePath, absDestFilePath));
}
