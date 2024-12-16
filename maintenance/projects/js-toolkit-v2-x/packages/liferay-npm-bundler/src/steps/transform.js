/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babel from 'babel-core';
import clone from 'clone';
import parseDataURL from 'data-urls';
import fs from 'fs-extra';
import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import * as gl from 'liferay-npm-build-tools-common/lib/globs';
import {getPackageTargetDir} from 'liferay-npm-build-tools-common/lib/packages';
import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';
import readJsonSync from 'read-json-sync';
import rimraf from 'rimraf';

import * as log from '../log';
import manifest from '../manifest';
import report from '../report';
import {findFiles, getDestDir, runInChunks, runPlugins} from './util';

/**
 * Transform root and dependency packages.
 * @param {PkgDesc} rootPkg the root package descriptor
 * @param {Array<PkgDesc>} depPkgs dependency package descriptors
 * @return {Promise}
 */
export default function transformPackages(rootPkg, depPkgs) {
	const dirtyPkgs = [rootPkg, ...depPkgs].filter((srcPkg) => !srcPkg.clean);

	return Promise.all(
		dirtyPkgs.map((srcPkg) => transformPackage(srcPkg))
	).then(() => log.debug(`Transformed ${dirtyPkgs.length} packages`));
}

/**
 *
 * @param {PkgDesc} srcPkg
 * @return {Promise}
 */
function transformPackage(srcPkg) {
	if (!manifest.isOutdated(srcPkg.id)) {
		return Promise.resolve();
	}

	log.debug(`Transforming package '${srcPkg.id}'...`);

	const destPkg = srcPkg.clone({
		dir: getDestDir(srcPkg),
	});

	return runBundlerPlugins('pre', srcPkg, destPkg)
		.then(() => babelifyPackage(destPkg))
		.then(() => runBundlerPlugins('post', srcPkg, destPkg))
		.then(() => renamePkgDirIfNecessary(destPkg))
		.then((destPkg) => manifest.addPackage(srcPkg, destPkg))
		.then(() => log.debug(`Transformed package '${srcPkg.id}'`));
}

/**
 * Process an NPM package with the configured liferay-nmp-bundler plugins. This
 * function is called two times (known as phases) per package: one before Babel
 * runs and one after.
 * @param {String} phase 'pre' or 'post' depending on what phase we are in
 * @param {PkgDesc} srcPkg the source package descriptor
 * @param {PkgDesc} destPkg the target package descriptor
 * @return {Promise} a Promise fulfilled when the process has been finished
 */
function runBundlerPlugins(phase, srcPkg, destPkg) {
	return new Promise((resolve, reject) => {
		try {
			const state = runPlugins(
				phase === 'pre'
					? project.transform.getPrePluginDescriptors(destPkg)
					: project.transform.getPostPluginDescriptors(destPkg),
				srcPkg,
				destPkg,
				{
					pkgJson: readJsonSync(
						destPkg.dir.join('package.json').asNative
					),
				},
				(plugin, log) => {
					report.packageProcessBundlerPlugin(
						phase,
						destPkg,
						plugin,
						log
					);

					if (log.errorsPresent) {
						report.warn(
							'There are errors for some of the ' +
								'liferay-npm-bundler plugins: please check ' +
								'details of bundler transformations.',
							{unique: true}
						);
					}
					else if (log.warnsPresent) {
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
				destPkg.dir.join('package.json').asNative,
				JSON.stringify(state.pkgJson, '', 2)
			);

			resolve();
		}
		catch (err) {
			reject(err);
		}
	});
}

/**
 * Run Babel on a package.
 * @param {PkgDesc} destPkg the package descriptor
 * @return {Promise} a Promise fulfilled when the process has been finished
 */
function babelifyPackage(destPkg) {

	// Make a copy of the package's Babel configuration

	const babelConfig = clone(project.transform.getBabelConfig(destPkg));

	// Tune babel config

	babelConfig.babelrc = false;
	babelConfig.compact = false;
	babelConfig.only = '**/*';
	if (babelConfig.sourceMaps === undefined) {
		babelConfig.sourceMaps = true;
	}

	// Report a copy of the package's Babel configuration before loading plugins

	report.packageProcessBabelConfig(destPkg, clone(babelConfig));

	// Intercept presets and plugins to load them from here

	babelConfig.plugins = project.transform.getBabelPlugins(destPkg);
	babelConfig.presets = [];

	// Determine file globs

	const globs = ['**/*.js', '!node_modules/**/*'];

	if (destPkg.isRoot) {
		globs.push(...gl.negate(project.transform.babelIgnores));
	}

	// Run babel through files

	const prjRelPaths = findFiles(
		project.dir.asNative,
		gl.prefix(`${project.dir.asPosix}/${destPkg.dir.asPosix}/`, globs)
	);

	log.debug(
		`Babelifying ${prjRelPaths.length} files in package '${destPkg.id}'...`
	);

	return runInChunks(
		prjRelPaths,
		project.misc.maxParallelFiles,
		0,
		(prjRelPath) => babelifyFile(destPkg, prjRelPath, babelConfig)
	);
}

/**
 *
 * @param {PkgDesc} destPkg
 * @param {string} prjRelPath
 * @param {object} babelConfig
 * @return {Promise}
 */
function babelifyFile(destPkg, prjRelPath, babelConfig) {
	return new Promise((resolve) => {
		const logger = new PluginLogger();

		babelIpc.set(project.dir.join(prjRelPath).asNative, {
			log: logger,
			manifest,
			rootPkgJson: clone(project.pkgJson),
			globalConfig: clone(project.globalConfig),
		});

		const fileAbsPath = project.dir.join(prjRelPath).asNative;
		const filePkgRelPath = project.dir
			.join(destPkg.dir)
			.relative(fileAbsPath).asNative;

		babel.transformFile(
			fileAbsPath,
			{
				filename: fileAbsPath,
				filenameRelative: prjRelPath,
				inputSourceMap: loadSourceMap(fileAbsPath),
				...babelConfig,
			},
			(err, result) => {

				// Generate and/or log results

				if (err) {
					logger.error('babel', err);

					report.warn(
						'Babel failed processing some .js files: ' +
							'check details of Babel transformations for more info.',
						{unique: true}
					);
				}
				else {
					const fileName = path.basename(fileAbsPath);

					fs.writeFileSync(
						fileAbsPath,
						`${result.code}\n` +
							`//# sourceMappingURL=${fileName}.map`
					);

					fs.writeFileSync(
						`${fileAbsPath}.map`,
						JSON.stringify(result.map)
					);
				}

				// Report result of babel run

				report.packageProcessBabelRun(destPkg, filePkgRelPath, logger);

				if (logger.errorsPresent) {
					report.warn(
						'There are errors for some of the ' +
							'Babel plugins: please check details ' +
							'of Babel transformations.',
						{unique: true}
					);
				}
				else if (logger.warnsPresent) {
					report.warn(
						'There are warnings for some of the ' +
							'Babel plugins: please check details ' +
							'of Babel transformations.',
						{unique: true}
					);
				}

				// Get rid of Babel IPC values

				babelIpc.clear(prjRelPath);

				// Resolve promise

				resolve();
			}
		);
	});
}

/**
 * Load the source map of a transpiled JS file.
 * @param  {string} filePath the path to the transpiled JS file
 * @return {Object|null} the source map object or null if not present
 */
export function loadSourceMap(filePath) {
	const fileContent = fs.readFileSync(filePath);

	const offset1 = fileContent.lastIndexOf('//# sourceMappingURL=');
	const offset2 = fileContent.lastIndexOf('/*# sourceMappingURL=');

	const offset = Math.max(offset1, offset2);

	const annotation = fileContent.toString().substring(offset);

	let matches = annotation.match(/\/\/# sourceMappingURL=(.*)/);
	if (!matches) {
		matches = annotation.match(/\/\*# sourceMappingURL=(.*) \*\//);

		if (!matches) {
			return null;
		}
	}

	const url = matches[1];

	if (url.indexOf('data:') === 0) {
		const parsedData = parseDataURL(url);

		if (parsedData) {
			const {body, mimeType} = parsedData;

			if (mimeType.toString() === 'application/json') {
				return JSON.parse(body.toString());
			}
		}
	}
	else {
		const sourceMapFile = path.normalize(
			path.join(path.dirname(filePath), url)
		);

		try {
			return readJsonSync(sourceMapFile);
		}
		catch (err) {

			// Swallow.

		}
	}

	return null;
}

/**
 * Rename a package folder if package.json doesn't match original package name
 * or version and the package is not the root package.
 * @param {PkgDesc} destPkg the package descriptor
 * @return {Promise} resolves to the (possibly) modified `destPkg`
 */
function renamePkgDirIfNecessary(destPkg) {
	if (destPkg.isRoot) {
		return Promise.resolve(destPkg);
	}

	const pkgJson = readJsonSync(destPkg.dir.join('package.json').asNative);
	const outputDirPath = path.dirname(destPkg.dir.asNative);

	if (pkgJson.name !== destPkg.name || pkgJson.version !== destPkg.version) {
		const newDirPath = path.join(
			outputDirPath,
			getPackageTargetDir(pkgJson.name, pkgJson.version)
		);

		rimraf.sync(newDirPath);

		return fs
			.move(destPkg.dir.asNative, newDirPath)
			.then(() => new PkgDesc(pkgJson.name, pkgJson.version, newDirPath));
	}

	return Promise.resolve(destPkg);
}
