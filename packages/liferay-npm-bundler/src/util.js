import fs from 'fs-extra';
import path from 'path';
import readJsonSync from 'read-json-sync';
import semver from 'semver';

import {getPackageTargetDir} from 'liferay-npm-build-tools-common/lib/packages';
import report from './report';

/**
 * Iterate through the elements of an array applying an async process serially
 * to each one of them.
 * @param {Array} values array of values to be iterated
 * @param {function} asyncProcess the async process (that returns a Promise) to
 *        be executed on each value
 * @return {Promise} a Promise that is resolved as soon as the iteration
 *         finishes
 */
export function iterateSerially(values, asyncProcess) {
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
 * Rename a package folder if package.json doesn't match original package name
 * or version.
 * @param {PkgDesc} pkg the package descriptor
 * @return {void}
 */
export function renamePkgDirIfPkgJsonChanged(pkg) {
	const pkgJson = readJsonSync(path.join(pkg.dir, 'package.json'));
	const outputDir = path.dirname(pkg.dir);

	if (pkgJson.name !== pkg.name || pkgJson.version !== pkg.version) {
		return fs.move(
			pkg.dir,
			path.join(
				outputDir,
				getPackageTargetDir(pkgJson.name, pkgJson.version)
			)
		);
	}
}

/**
 * Report linked dependencies of a given package.json
 * @param  {Object} pkgJson pacakge.json file contents
 * @return {void}
 */
export function reportLinkedDependencies(pkgJson) {
	['dependencies', 'devDependencies'].forEach(scope => {
		if (pkgJson[scope] != null) {
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
		}
	});
}
