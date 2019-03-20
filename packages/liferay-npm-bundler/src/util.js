/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import parseDataURL from 'data-urls';
import fs from 'fs-extra';
import path from 'path';
import readJsonSync from 'read-json-sync';
import semver from 'semver';

import {getPackageTargetDir} from 'liferay-npm-build-tools-common/lib/packages';
import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
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

		const val = values[0];

		const p = asyncProcess(val);

		p.then(() => {
			iterateSerially(values.slice(1), asyncProcess).then(() => {
				resolve();
			});
		});
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

	if (url.indexOf('data:') == 0) {
		const parsedData = parseDataURL(url);

		if (parsedData) {
			const {body, mimeType} = parsedData;

			if (mimeType.toString() === 'application/json') {
				return JSON.parse(body.toString());
			}
		}
	} else {
		const sourceMapFile = path.normalize(
			path.join(path.dirname(filePath), url)
		);

		try {
			return readJsonSync(sourceMapFile);
		} catch (err) {
			// Swallow.
		}
	}

	return null;
}

/**
 * Rename a package folder if package.json doesn't match original package name
 * or version.
 * @param {PkgDesc} pkg the package descriptor
 * @return {Promise} a Promise that returns the modified PkgDesc
 */
export function renamePkgDirIfPkgJsonChanged(pkg) {
	const pkgJson = readJsonSync(path.join(pkg.dir, 'package.json'));
	const outputDir = path.dirname(pkg.dir);

	if (pkgJson.name !== pkg.name || pkgJson.version !== pkg.version) {
		const newDir = path.join(
			outputDir,
			getPackageTargetDir(pkgJson.name, pkgJson.version)
		);

		return fs
			.move(pkg.dir, newDir)
			.then(
				() =>
					new PkgDesc(
						pkgJson.name,
						pkgJson.version,
						newDir,
						pkg.isRoot
					)
			);
	}

	return Promise.resolve(pkg);
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
						'node_modules',
						depName,
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
