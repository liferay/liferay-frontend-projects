import * as babel from 'babel-core';
import fs from 'fs-extra';
import globby from 'globby';
import {getPackageTargetDir} from 'liferay-npm-build-tools-common/lib/packages';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import path from 'path';
import pretty from 'pretty-time';
import readJsonSync from 'read-json-sync';
import semver from 'semver';

import * as config from './config';
import {getPackageDependencies} from './dependencies';
import * as log from './log';
import report from './report';

/**
 * Default entry point for the liferay-npm-bundler.
 * @param {Array} args command line arguments
 * @return {void}
 */
export default function(args) {
	let promises = [];

	const versionsInfo = config.getVersionsInfo();

	if (args[0] === '-v' || args[0] === '--version') {
		console.log(JSON.stringify(versionsInfo, null, 2));
		return;
	}

	report.versionsInfo(versionsInfo);

	const outputDir = path.resolve(config.getOutputDir());

	// Create work directories
	fs.mkdirsSync(path.join(outputDir, 'node_modules'));

	// Copy project's package.json
	promises.push(copyRootPackageJson(outputDir));

	// Grab NPM dependencies
	let pkgs = getPackageDependencies('.', config.getIncludeDependencies());
	pkgs = Object.keys(pkgs).map(id => pkgs[id]);
	pkgs = pkgs.filter(pkg => pkg.dir != '.');

	report.dependencies(pkgs);

	// Process NPM dependencies
	const start = process.hrtime();

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

	Promise.all(promises)
		.then(() => {
			const hrtime = process.hrtime(start);

			log.info(`Bundling took ${pretty(hrtime)}`);
			report.executionTime(hrtime);

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
function copyRootPackageJson(outputDir) {
	const pkgJson = readJsonSync('package.json');

	['dependencies', 'devDependencies'].forEach(scope => {
		Object.keys(pkgJson[scope]).forEach(depName => {
			const depVersion = pkgJson[scope][depName];

			if (semver.validRange(depVersion) == null) {
				const depPkgJsonPath = path.join(
					depVersion.substring(5),
					'package.json'
				);

				const depPkgJson = readJsonSync(depPkgJsonPath);

				pkgJson[scope][depName] = depPkgJson.version;

				report.linkedDependency(
					depName,
					depVersion,
					depPkgJson.version
				);
			}
		});
	});

	return fs.writeJson(path.join(outputDir, 'package.json'), pkgJson, {
		spaces: 2,
	});
}

/**
 * Iterate through the elements of an array applying an async process serially
 * to each one of them.
 * @param {Array} values array of values to be iterated
 * @param {function} asyncProcess the async process (that returns a Promise) to
 *        be executed on each value
 * @return {Promise} a Promise that is resolved as soon as the iteration
 *         finishes
 */
function iterateSerially(values, asyncProcess) {
	return new Promise(resolve => {
		if (values.length == 0) {
			resolve();
			return;
		}

		let val = values[0];

		let p = asyncProcess(val);

		p.then(() => {
			iterateSerially(values.slice(1), asyncProcess).then(() => {
				resolve();
			});
		});
	});
}

/**
 * Bundle a npm package
 * @param {Object} pkg the package descriptor hash containing id, name, version
 *        and dir fields
 * @param {String} outputDir directory where bundled packages are placed
 * @return {Promise} a promise that is fulfilled when the package is bundled
 */
function bundlePackage(pkg, outputDir) {
	const outPkgDir = path.join(
		outputDir,
		'node_modules',
		getPackageTargetDir(pkg.name, pkg.version)
	);

	try {
		if (fs.statSync(outPkgDir).isDirectory()) {
			log.debug(`Skipping ${pkg.id} (already bundled)`);
			return Promise.resolve();
		}
	} catch (err) {}

	log.debug(`Bundling ${pkg.id}`);

	fs.mkdirsSync(outPkgDir);

	return copyPackage(pkg, outPkgDir)
		.then(() => (pkg.dir = outPkgDir))
		.then(() => processPackage('pre', pkg))
		.then(() => runBabel(pkg))
		.then(() => processPackage('post', pkg))
		.then(() => log.debug(`Bundled ${pkg.id}`));
}

/**
 * Copy an NPM package to output directory.
 * @param {Object} pkg the package descriptor hash containing id, name, version
 *        and dir fields
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
 * @param {Object} pkg the package descriptor hash containing id, name, version
 *        and dir fields
 * @return {Promise} a Promise fulfilled when the process has been finished
 */
function processPackage(phase, pkg) {
	return new Promise((resolve, reject) => {
		const pkgJsonPath = path.join(pkg.dir, 'package.json');
		const pkgJson = readJsonSync(pkgJsonPath);

		let state = {
			pkgJson: pkgJson,
		};

		try {
			config.getPlugins(phase, pkg).forEach(plugin => {
				let logger = new PluginLogger();

				plugin.run({pkg, config: plugin.config, log: logger}, state);

				report.packageProcessBundlerPlugin(phase, pkg, plugin, logger);
			});
		} catch (err) {
			reject(err);
		}

		fs.writeFileSync(pkgJsonPath, JSON.stringify(state.pkgJson, '', 2));

		resolve();
	});
}

/**
 * Run Babel on a package.
 * @param {Object} pkg the package descriptor hash containing id, name, version
 *        and dir fields
 * @return {Promise} a Promise fulfilled when the process has been finished
 */
function runBabel(pkg) {
	// Make a copy of the package's Babel configuration
	const babelConfig = Object.assign({}, config.getBabelConfig(pkg));

	// Tune babel config
	babelConfig.babelrc = false;
	babelConfig.only = '**/*';
	if (babelConfig.sourceMaps === undefined) {
		babelConfig.sourceMaps = true;
	}

	// Report a copy of the package's Babel configuration before loading plugins
	report.packageProcessBabelConfig(pkg, Object.assign({}, babelConfig));

	// Intercept presets and plugins to load them from here
	babelConfig.plugins = config.loadBabelPlugins(
		babelConfig.presets || [],
		babelConfig.plugins || []
	);
	babelConfig.presets = [];

	// Run babel through it
	return globby([`${pkg.dir}/**/*.js`]).then(filePaths => {
		const promises = filePaths.map(
			filePath =>
				new Promise(resolve => {
					const logger = new PluginLogger();

					PluginLogger.set(filePath, logger);

					babel.transformFile(
						filePath,
						Object.assign(
							{
								filenameRelative: filePath,
							},
							babelConfig
						),
						(err, result) => {
							// Generate and/or log results
							if (err) {
								log.error(
									`Babel failed processing`,
									`${filePath.substr(
										filePath.indexOf(pkg.id)
									)}:`,
									'it will be copied verbatim (see report file for more info)'
								);

								logger.error('babel', err);

								report.warn(
									'Babel failed processing some .js files: check details of Babel transformations for more info.',
									{unique: true}
								);
							} else {
								const fileName = path.basename(filePath);

								fs.writeFileSync(
									filePath,
									`${result.code}\n` +
										`//# sourceMappingURL=${fileName}.map`
								);

								fs.writeFileSync(
									`${filePath}.map`,
									JSON.stringify(result.map)
								);
							}

							// Report result of babel run
							report.packageProcessBabelRun(
								pkg,
								filePath.substr(
									filePath.indexOf(pkg.id) + pkg.id.length + 1
								),
								logger
							);

							// Get rid of logger
							PluginLogger.delete(filePath);

							// Resolve promise
							resolve();
						}
					);
				})
		);

		return Promise.all(promises);
	});
}
