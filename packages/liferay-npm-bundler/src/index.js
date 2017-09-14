import * as babel from 'babel-core';
import cpFile from 'cp-file';
import fs from 'fs';
import globby from 'globby';
import { mkdirp } from 'liferay-npm-build-tools-common/lib/fs';
import path from 'path';
import readJsonSync from 'read-json-sync';

import * as config from './config';
import { getPackageDependencies } from './dependencies';

/**
 * Default entry point for the liferay-npm-bundler.
 * @param {Array} args the CLI arguments
 * @return {void}
 */
export default function(args) {
	let promises = [];

	const outputDir = config.getOutputDir();

	// Create work directories
	mkdirp(`${outputDir}/node_modules`);

	// Copy project's package.json
	promises.push(copyRootPackageJson(outputDir));

	// Grab NPM dependencies
	let pkgs = getPackageDependencies('.');
	pkgs = Object.keys(pkgs).map(id => pkgs[id]);
	pkgs = pkgs.filter(pkg => pkg.dir != '.');

	// Process NPM dependencies
	const start = new Date().getTime();

	pkgs.forEach(pkg => {
		const outPkgDir = `${outputDir}/node_modules/${pkg.id.replace(
			'/',
			'%2F',
		)}`;

		try {
			if (fs.statSync(outPkgDir).isDirectory()) {
				console.log(`Skipping ${pkg.id} (already bundled)`);
				return;
			}
		} catch (err) {}

		console.log(`Bundling ${pkg.id}`);

		mkdirp(outPkgDir);

		promises.push(
			copyPackage(pkg, outPkgDir)
				.then(() => (pkg.dir = outPkgDir))
				.then(() => processPackage('pre', pkg))
				.then(() => runBabel(pkg))
				.then(() => processPackage('post', pkg))
				.then(() => console.log(`Bundled ${pkg.id}`)),
		);
	});

	Promise.all(promises)
		.then(() =>
			console.log(
				`Bundled all dependencies in ${new Date().getTime() -
					start} milliseconds`,
			),
		)
		.catch(function(err) {
			console.log(err);
			process.exit(1);
		});
}

/**
 * Copy project root package.json file to output directory.
 * @param {String} outputDir the output directory path
 * @return {Promise} a Promise fulfilled when the copy has been finished
 */
function copyRootPackageJson(outputDir) {
	return cpFile('package.json', `${outputDir}/package.json`);
}

/**
 * Copy an NPM package to output directory.
 * @param {Object} pkg the package descriptor hash containing id, name, version
 *        and dir fields
 * @param {String} dir the output directory path
 * @return {Promise} a Promise fulfilled when the copy has been finished
 */
function copyPackage(pkg, dir) {
	const exclusions = config.getExclusions(pkg);

	const globs = [`${pkg.dir}/**/*`, `!${pkg.dir}/node_modules/**/*`].concat(
		exclusions.map(exclusion => `!${pkg.dir}/${exclusion}`),
	);

	return globby(globs).then(paths => {
		paths = paths.map(path => path.substring(pkg.dir.length + 1));

		const promises = paths.map(path =>
			cpFile(`${pkg.dir}/${path}`, `${dir}/${path}`).catch(err => {}),
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
		const pkgJsonPath = `${pkg.dir}/package.json`;
		const pkgJson = readJsonSync(pkgJsonPath);

		let state = {
			pkgJson: pkgJson,
		};

		try {
			config.getPlugins(phase, pkg).forEach(plugin => {
				plugin.run({ pkg, config: plugin.config }, state);
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
	const babelConfig = config.getBabelConfig(pkg);

	// Intercept presets and plugins to load them from here
	babelConfig.plugins = config.loadBabelPlugins(
		babelConfig.presets || [],
		babelConfig.plugins || [],
	);
	babelConfig.presets = [];

	// Tune babel config
	babelConfig.babelrc = false;
	babelConfig.only = '**/*';
	if (babelConfig.sourceMaps === undefined) {
		babelConfig.sourceMaps = true;
	}

	// Run babel through it
	return globby([`${pkg.dir}/**/*.js`]).then(filePaths => {
		const promises = filePaths.map(
			filePath =>
				new Promise((resolve, reject) => {
					babel.transformFile(
						filePath,
						Object.assign(
							{
								filenameRelative: filePath,
							},
							babelConfig,
						),
						(err, result) => {
							if (err) {
								console.log(
									`Error processing file: ${filePath}`,
								);
								reject(err);
							} else {
								const fileName = path.basename(filePath);

								fs.writeFileSync(
									filePath,
									`${result.code}\n` +
										`//# sourceMappingURL=${fileName}.map`,
								);

								fs.writeFileSync(
									`${filePath}.map`,
									JSON.stringify(result.map),
								);

								resolve();
							}
						},
					);
				}),
		);

		return Promise.all(promises);
	});
}
