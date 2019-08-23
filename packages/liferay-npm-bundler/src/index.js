/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import globby from 'globby';
import * as gl from 'liferay-npm-build-tools-common/lib/globs';
import {getPackageTargetDir} from 'liferay-npm-build-tools-common/lib/packages';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';
import pretty from 'pretty-time';

import * as config from './config';
import {addPackageDependencies, getRootPkg} from './dependencies';
import * as insight from './insight';
import createJar from './jar';
import * as log from './log';
import manifest from './manifest';
import report from './report';

import {runRules, runBundlerPlugins, runCopyPlugins, runBabel} from './runners';
import {
	iterateSerially,
	renamePkgDirIfPkgJsonChanged,
	reportLinkedDependencies,
} from './util';

/**
 * Default entry point for the liferay-npm-bundler.
 * @param {Array} args command line arguments
 * @return {void}
 */
export default function(args) {
	if (args[0] === '-h' || args[0] === '--help') {
		console.log(
			'Usage:',
			'liferay-npm-bundler',
			'[-h|--help]',
			'[-v|--version]',
			'[-r|--dump-report]',
			'[-j|--create-jar]',
			'[--no-tracking]'
		);
		return;
	}

	const versionsInfo = config.getVersionsInfo();

	if (args[0] === '-v' || args[0] === '--version') {
		console.log(JSON.stringify(versionsInfo, null, 2));
		return;
	}

	report.versionsInfo(versionsInfo);

	if (config.isNoTracking()) {
		run();
	} else {
		insight.init().then(run);
	}
}

/**
 * Real tool execution
 * @return {void}
 */
function run() {
	try {
		const start = process.hrtime();

		// Get root package
		const rootPkg = getRootPkg();

		report.rootPackage(rootPkg);

		// Compute dependency packages
		let pkgs = addPackageDependencies(
			{},
			'.',
			config.bundler.getIncludeDependencies()
		);

		pkgs = Object.values(pkgs).filter(pkg => !pkg.isRoot);

		report.dependencies(pkgs);
		reportLinkedDependencies(project.pkgJson);

		// Create work directories
		const outputDir = path.resolve(project.buildDir);
		fs.mkdirsSync(path.join(outputDir, 'node_modules'));

		// Report rules config
		report.rulesConfig(project.rules.config);

		// Warn about incremental builds
		if (manifest.loadedFromFile) {
			report.warn(
				'This report is from an incremental build: some steps may be ' +
					'missing (you may remove the output directory to force a ' +
					'full build).'
			);
		}

		// Do things
		copyPackages(outputDir, rootPkg, pkgs)
			.then(() => runRules(outputDir))
			.then(() => transformPackages(outputDir, rootPkg, pkgs))
			.then(() => (project.jar.supported ? createJar() : undefined))
			.then(() => {
				// Report and show execution time
				const hrtime = process.hrtime(start);
				report.executionTime(hrtime);
				log.info(`Bundling took ${pretty(hrtime)}`);

				// Send report analytics data
				// report.sendAnalytics();

				// Write report if requested
				if (config.isDumpReport()) {
					fs.writeFileSync(
						config.getReportFilePath(),
						report.toHtml()
					);
					log.info(`Report written to ${config.getReportFilePath()}`);
				} else if (report.warningsPresent) {
					log.debug(`
*************************************************************

             WARNING FROM liferay-npm-bundler

The build has emitted some warning messages: we recommend
cleaning the output, activating the 'dump-report' option
in '.npmbundlerrc', and then reviewing the generated
'liferay-npm-bundler-report.html' to make sure no problems
will arise during runtime.

*************************************************************
`);
				}
			})
			.catch(abort);
	} catch (err) {
		abort(err);
	}
}

/**
 * Copy root and dependency packages to output directory.
 * @param {string} outputDir
 * @param {PkgDesc} rootPkg the root package descriptor
 * @param {Array<PkgDesc>} pkgs dependency package descriptors
 * @return {Promise}
 */
function copyPackages(outputDir, rootPkg, pkgs) {
	return Promise.all([
		copyRootPackage(outputDir, rootPkg),
		iterateSerially(pkgs, pkg => copyPackage(outputDir, pkg)),
	]);
}

/**
 * Copy project's package.json and configured sources to output directory.
 * @param {string} outputDir
 * @param {PkgDesc} rootPkg the root package descriptor
 * @return {Promise}
 */
function copyRootPackage(outputDir, rootPkg) {
	if (!manifest.isOutdated(rootPkg)) {
		return Promise.resolve();
	}

	const pkg = rootPkg.clone({dir: outputDir});

	const promises = [];

	// Copy package.json
	promises.push(
		fs.copy(
			path.join(rootPkg.dir, 'package.json'),
			path.join(pkg.dir, 'package.json')
		)
	);

	// Copy configured sources
	const copiedFiles = [];
	const allFiles = [];

	promises.push(
		...project.sources.map(source => {
			const glob = gl.prefix(
				`${rootPkg.dir}/${source.dir}/`,
				source.files
			);
			const stripCount = rootPkg.dir.length + 1 + source.dir.length + 1;

			allFiles.push(
				...globby
					.sync(`${rootPkg.dir}/${source.dir}/**/*`)
					.filter(file => fs.statSync(file).isFile())
			);

			return globby(glob).then(files =>
				Promise.all(
					files
						.filter(file => fs.statSync(file).isFile())
						.map(file => file.substr(stripCount))
						.map(file =>
							fs
								.copy(
									path.join(rootPkg.dir, source.dir, file),
									path.join(pkg.dir, file)
								)
								.then(() => copiedFiles.push(file))
						)
				)
			);
		})
	);

	return Promise.all(promises).then(() =>
		report.packageCopy(pkg, allFiles, copiedFiles)
	);
}

/**
 * Copy an NPM package to output directory.
 * @param {String} outputDir the output directory path
 * @param {PkgDesc} srcPkg the package descriptor
 * @return {Promise} a Promise fulfilled with true|false stating that the copy has been finished|rejected
 */
function copyPackage(outputDir, srcPkg) {
	if (!manifest.isOutdated(srcPkg)) {
		log.debug(`Skipping ${srcPkg.id} (already transformed)`);
		return Promise.resolve();
	}

	const outPkgDir = path.join(
		outputDir,
		'node_modules',
		getPackageTargetDir(srcPkg.name, srcPkg.version)
	);
	const pkg = srcPkg.clone({dir: outPkgDir});

	const exclusions = config.bundler.getExclusions(srcPkg);

	// Optimize execution time when a "exclude everything" glob is found
	if (exclusions.find(exclusion => exclusion === '**/*')) {
		return Promise.resolve(false);
	}

	// Determine what to copy
	const globs = [
		`${srcPkg.dir}/**/*`,
		`!${srcPkg.dir}/node_modules/**/*`,
	].concat(gl.negate(gl.prefix(`${srcPkg.dir}/`, exclusions)));

	return globby(globs).then(files => {
		// Filter files with copy-plugins
		files = runCopyPlugins(srcPkg, pkg, files);

		// Copy files
		const fileFilter = path => fs.statSync(path).isFile();
		const relativePathMapper = path =>
			path.substring(srcPkg.dir.length + 1);

		files = files.filter(fileFilter).map(relativePathMapper);

		const allFiles = globby
			.sync([`${srcPkg.dir}/**/*`])
			.filter(fileFilter)
			.map(relativePathMapper);

		report.packageCopy(srcPkg, allFiles, files);

		if (files.length == 0) {
			return Promise.resolve(false);
		} else {
			return Promise.all(
				files.map(filePath =>
					fs.copy(
						path.join(srcPkg.dir, filePath),
						path.join(pkg.dir, filePath)
					)
				)
			).then(() => true);
		}
	});
}

/**
 * Transform root and dependency packages.
 * @param {string} outputDir
 * @param {PkgDesc} rootPkg the root package descriptor
 * @param {Array<PkgDesc>} pkgs dependency package descriptors
 * @return {Promise}
 */
function transformPackages(outputDir, rootPkg, pkgs) {
	return Promise.all([
		transformRootPackage(outputDir, rootPkg),
		iterateSerially(pkgs, pkg => transformPackage(outputDir, pkg)),
	]);
}

/**
 * Transform root package.
 * @param {String} outputDir directory where bundled packages are placed
 * @param {PkgDesc} rootPkg the root package descriptor
 * @return {Promise}
 */
function transformRootPackage(outputDir, rootPkg) {
	if (!manifest.isOutdated(rootPkg)) {
		return Promise.resolve();
	}

	log.debug(`Transforming root package`);

	const pkg = rootPkg.clone({dir: outputDir});

	return runBundlerPlugins('pre', rootPkg, pkg)
		.then(() => runBabel(pkg, {ignore: config.babel.getIgnore()}))
		.then(() => runBundlerPlugins('post', rootPkg, pkg))
		.then(() => manifest.addPackage(rootPkg, pkg))
		.then(() => manifest.save())
		.then(() => log.debug(`Transformed root package`));
}

/**
 * Transform a npm package
 * @param {String} outputDir directory where bundled packages are placed
 * @param {PkgDesc} srcPkg the source package descriptor
 * @return {Promise} a promise that is fulfilled when the package is bundled
 */
function transformPackage(outputDir, srcPkg) {
	if (!manifest.isOutdated(srcPkg)) {
		log.debug(`Skipping ${srcPkg.id} (already transformed)`);
		return Promise.resolve();
	}

	log.debug(`Transforming ${srcPkg.id}`);

	const outPkgDir = path.join(
		outputDir,
		'node_modules',
		getPackageTargetDir(srcPkg.name, srcPkg.version)
	);

	const pkg = srcPkg.clone({dir: outPkgDir});

	return runBundlerPlugins('pre', srcPkg, pkg)
		.then(() => runBabel(pkg))
		.then(() => runBundlerPlugins('post', srcPkg, pkg))
		.then(() => renamePkgDirIfPkgJsonChanged(pkg))
		.then(pkg => manifest.addPackage(srcPkg, pkg))
		.then(() => manifest.save())
		.then(() => log.debug(`Transformed '${pkg.id}' package`));
}

/**
 * Abort execution showing error message
 * @param  {Object} err the error object
 * @return {void}
 */
function abort(err) {
	log.error(`

${err.stack}

`);

	process.exit(1);
}
