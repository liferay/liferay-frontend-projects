import fs from 'fs-extra';
import globby from 'globby';
import * as gl from 'liferay-npm-build-tools-common/lib/globs';
import {getPackageTargetDir} from 'liferay-npm-build-tools-common/lib/packages';
import path from 'path';
import pretty from 'pretty-time';
import readJsonSync from 'read-json-sync';

import * as config from './config';
import {addPackageDependencies, getRootPkg} from './dependencies';
import * as insight from './insight';
import createJar from './jar';
import * as log from './log';
import manifest from './manifest';
import report from './report';

import {runPlugins, runBabel} from './runners';
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

		// Create work directories
		const outputDir = path.resolve(config.getOutputDir());
		fs.mkdirsSync(path.join(outputDir, 'node_modules'));

		let promises = [];

		// Copy project's package.json
		promises.push(bundleRootPackage(outputDir));
		report.rootPackage(getRootPkg());

		// Grab NPM dependencies
		let pkgs = addPackageDependencies(
			{},
			'.',
			config.bundler.getIncludeDependencies()
		);

		pkgs = Object.keys(pkgs)
			.map(id => pkgs[id])
			.filter(pkg => !pkg.isRoot);

		report.dependencies(pkgs);
		reportLinkedDependencies(readJsonSync('package.json'));

		// Process NPM dependencies
		log.info(`Bundling ${pkgs.length} dependencies...`);

		if (config.bundler.isProcessSerially()) {
			report.warn(
				'Option process-serially is on: this may degrade build performance.'
			);

			promises.push(
				iterateSerially(pkgs, pkg => bundlePackage(pkg, outputDir))
			);
		} else {
			promises.push(...pkgs.map(pkg => bundlePackage(pkg, outputDir)));
		}

		// Report results
		Promise.all(promises)
			.then(() => (config.isCreateJar() ? createJar() : undefined))
			.then(() => {
				// Report and show execution time
				const hrtime = process.hrtime(start);
				report.executionTime(hrtime);
				log.info(`Bundling took ${pretty(hrtime)}`);

				// Send report analytics data
				report.sendAnalytics();

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
 * Abort execution showing error message
 * @param  {Object} err the error object
 * @return {void}
 */
function abort(err) {
	log.error(err);
	process.exit(1);
}

/**
 * Copy project root package.json file to output directory.
 * @param {String} outputDir the output directory path
 * @return {Promise} a Promise fulfilled when the copy has been finished
 */
function bundleRootPackage(outputDir) {
	const srcPkg = getRootPkg();
	const pkg = srcPkg.clone({dir: outputDir});

	if (!manifest.isOutdated(srcPkg)) {
		log.debug(`Skipping root package (already bundled)`);
		return Promise.resolve();
	}

	// Copy source package.json
	const srcPkgJson = readJsonSync('package.json');

	fs.writeFileSync(
		path.join(pkg.dir, 'package.json'),
		JSON.stringify(srcPkgJson, '', 2)
	);

	// Process package
	return processPackage('pre', srcPkg, pkg)
		.then(() => runBabel(pkg, {ignore: config.babel.getIgnore()}))
		.then(() => processPackage('post', srcPkg, pkg))
		.then(() => manifest.addPackage(srcPkg, pkg))
		.then(() => manifest.save())
		.then(() => log.debug(`Bundled root package`));
}

/**
 * Bundle a npm package
 * @param {PkgDesc} srcPkg the source package descriptor
 * @param {String} outputDir directory where bundled packages are placed
 * @return {Promise} a promise that is fulfilled when the package is bundled
 */
function bundlePackage(srcPkg, outputDir) {
	if (!manifest.isOutdated(srcPkg)) {
		log.debug(`Skipping ${srcPkg.id} (already bundled)`);
		return Promise.resolve();
	}

	log.debug(`Bundling ${srcPkg.id}`);

	const outPkgDir = path.join(
		outputDir,
		'node_modules',
		getPackageTargetDir(srcPkg.name, srcPkg.version)
	);

	let pkg = srcPkg.clone({dir: outPkgDir});

	return new Promise((resolve, reject) => {
		copyPackage(srcPkg, outPkgDir)
			.then(copied => {
				if (!copied) {
					resolve();
					return;
				}

				processPackage('pre', srcPkg, pkg)
					.then(() => runBabel(pkg))
					.then(() => processPackage('post', srcPkg, pkg))
					.then(() => renamePkgDirIfPkgJsonChanged(pkg))
					.then(pkg => manifest.addPackage(srcPkg, pkg))
					.then(() => manifest.save())
					.then(() => log.debug(`Bundled ${pkg.id}`))
					.then(resolve)
					.catch(reject);
			})
			.catch(reject);
	});
}

/**
 * Copy an NPM package to output directory.
 * @param {PkgDesc} pkg the package descriptor
 * @param {String} dir the output directory path
 * @return {Promise} a Promise fulfilled with true|false stating that the copy has been finished|rejected
 */
function copyPackage(pkg, dir) {
	const exclusions = config.bundler.getExclusions(pkg);

	// Determine what to copy
	const globs = [`${pkg.dir}/**/*`, `!${pkg.dir}/node_modules/**/*`].concat(
		gl.negate(gl.prefix(`${pkg.dir}/`, exclusions))
	);

	return globby(globs).then(files => {
		// Filter files with copy-plugins
		const state = runPlugins(
			config.bundler.getPlugins('copy', pkg),
			pkg,
			pkg.clone({dir: dir}),
			{
				files,
			},
			(plugin, log) => {
				report.packageProcessBundlerPlugin('copy', pkg, plugin, log);
			}
		);
		files = state.files;

		// Copy files
		const fileFilter = path => fs.statSync(path).isFile();
		const relativePathMapper = path => path.substring(pkg.dir.length + 1);

		files = files.filter(fileFilter).map(relativePathMapper);

		const allFiles = globby
			.sync([`${pkg.dir}/**/*`])
			.filter(fileFilter)
			.map(relativePathMapper);

		report.packageCopy(pkg, allFiles, files);

		if (files.length == 0) {
			return Promise.resolve(false);
		} else {
			const promises = files.map(path =>
				fs.copy(`${pkg.dir}/${path}`, `${dir}/${path}`)
			);

			return Promise.all(promises).then(() => true);
		}
	});
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
function processPackage(phase, srcPkg, pkg) {
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
