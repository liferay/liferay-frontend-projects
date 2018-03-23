import fs from 'fs-extra';
import globby from 'globby';
import {getPackageTargetDir} from 'liferay-npm-build-tools-common/lib/packages';
import path from 'path';
import pretty from 'pretty-time';
import readJsonSync from 'read-json-sync';

import * as config from './config';
import * as insight from './insight';
import {getPackageDependencies, getRootPkg} from './dependencies';
import * as log from './log';
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
	const versionsInfo = config.getVersionsInfo();

	if (args[0] === '-v' || args[0] === '--version') {
		console.log(JSON.stringify(versionsInfo, null, 2));
		return;
	} else {
		report.versionsInfo(versionsInfo);
	}

	insight.init().then(run);
}

/**
 * Real tool execution
 * @return {void}
 */
function run() {
	const start = process.hrtime();

	// Create work directories
	const outputDir = path.resolve(config.getOutputDir());
	fs.mkdirsSync(path.join(outputDir, 'node_modules'));

	let promises = [];

	// Copy project's package.json
	promises.push(bundleRootPackage(outputDir));

	// Grab NPM dependencies
	let pkgs = getPackageDependencies('.', config.getIncludeDependencies());
	pkgs = Object.keys(pkgs)
		.map(id => pkgs[id])
		.filter(pkg => !pkg.isRoot);
	report.dependencies(pkgs);

	// Process NPM dependencies
	log.info(`Bundling ${pkgs.length} dependencies...`);

	if (config.isProcessSerially()) {
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
		.then(() => {
			const hrtime = process.hrtime(start);

			report.executionTime(hrtime);

			log.info(`Bundling took ${pretty(hrtime)}`);

			// Send report analytics data
			report.sendAnalytics();

			// Write report if requested
			if (config.isDumpReport()) {
				fs.writeFileSync(config.getReportFilePath(), report.toHtml());
				log.info(`Report written to ${config.getReportFilePath()}`);
			}
		})
		.catch(function(err) {
			log.error(err);
			process.exit(1);
		});
}

/**
 * Copy project root package.json file to output directory.
 * @param {String} outputDir the output directory path
 * @return {Promise} a Promise fulfilled when the copy has been finished
 */
function bundleRootPackage(outputDir) {
	const srcPkgJson = readJsonSync('package.json');

	reportLinkedDependencies(srcPkgJson);

	const destJsonPath = path.join(outputDir, 'package.json');

	return new Promise(resolve => {
		// Copy source package.json
		fs.writeFileSync(destJsonPath, JSON.stringify(srcPkgJson, '', 2));

		// Run plugins
		const state = runPlugins(
			config.getRootPackagePlugins(),
			getRootPkg(),
			getRootPkg().clone({dir: outputDir}),
			(plugin, log) => {
				report.rootPackageProcessBundlerPlugin(plugin, log);
			}
		);

		// Rewrite package.json
		fs.writeFileSync(destJsonPath, JSON.stringify(state.pkgJson, '', 2));

		resolve();
	});
}

/**
 * Bundle a npm package
 * @param {PkgDesc} srcPkg the source package descriptor
 * @param {String} outputDir directory where bundled packages are placed
 * @return {Promise} a promise that is fulfilled when the package is bundled
 */
function bundlePackage(srcPkg, outputDir) {
	const outPkgDir = path.join(
		outputDir,
		'node_modules',
		getPackageTargetDir(srcPkg.name, srcPkg.version)
	);

	// Skip if package already exists
	try {
		if (fs.statSync(outPkgDir).isDirectory()) {
			log.debug(`Skipping ${srcPkg.id} (already bundled)`);
			return Promise.resolve();
		}
	} catch (err) {}

	log.debug(`Bundling ${srcPkg.id}`);

	const pkg = srcPkg.clone({dir: outPkgDir});

	fs.mkdirsSync(outPkgDir);

	return copyPackage(srcPkg, outPkgDir)
		.then(() => processPackage('pre', srcPkg, pkg))
		.then(() => runBabel(pkg))
		.then(() => processPackage('post', srcPkg, pkg))
		.then(() => renamePkgDirIfPkgJsonChanged(pkg))
		.then(() => log.debug(`Bundled ${pkg.id}`));
}

/**
 * Copy an NPM package to output directory.
 * @param {PkgDesc} pkg the package descriptor
 * @param {String} dir the output directory path
 * @return {Promise} a Promise fulfilled when the copy has been finished
 */
function copyPackage(pkg, dir) {
	const rawGlobs = [`${pkg.dir}/**/*`, `!${pkg.dir}/node_modules/**/*`];

	const exclusions = config.getExclusions(pkg);

	const globs = rawGlobs.concat(
		exclusions.map(exclusion => `!${pkg.dir}/${exclusion}`)
	);

	return globby(globs).then(paths => {
		const fileFilter = path => fs.statSync(path).isFile();
		const relativePathMapper = path => path.substring(pkg.dir.length + 1);

		paths = paths.filter(fileFilter).map(relativePathMapper);

		const rawPaths = globby
			.sync(rawGlobs)
			.filter(fileFilter)
			.map(relativePathMapper);

		report.packageCopy(pkg, rawPaths, paths, exclusions);

		const promises = paths.map(path =>
			fs.copy(`${pkg.dir}/${path}`, `${dir}/${path}`)
		);

		return Promise.all(promises);
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
				config.getPlugins(phase, pkg),
				srcPkg,
				pkg,
				(plugin, log) => {
					report.packageProcessBundlerPlugin(phase, pkg, plugin, log);
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
