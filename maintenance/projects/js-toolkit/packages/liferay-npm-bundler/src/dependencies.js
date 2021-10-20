/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';
import readJsonSync from 'read-json-sync';
import resolveModule from 'resolve';

import report from './report';

const pkgJson = project.pkgJson;
const rootPkg = new PkgDesc(pkgJson.name, pkgJson.version);

/**
 * Get root package descriptor
 * @return {PkgDesc} the root package descriptor
 */
export function getRootPkg() {
	return rootPkg;
}

/**
 * Recursively find the dependencies of a package and return them as PkgDesc
 * objects.
 * @param {object} collectedDependencies a hash of objects where key is the
 * 					package id and values are PkgDesc objects
 * @param {string} baseDirPath directory where package lives in
 * @param {Array} extraDependencies an array of package names to add to
 *					dependencies collected from package.json
 * @return {{[pkgId:string]: PkgDesc}} the given collectedDependencies object
 */
export function addPackageDependencies(
	collectedDependencies,
	baseDirPath,
	extraDependencies = []
) {
	const packageJson = readJsonSync(path.join(baseDirPath, '/package.json'));
	const pkg = new PkgDesc(
		packageJson.name,
		packageJson.version,
		path.resolve(baseDirPath) === path.resolve(project.dir.asNative)
			? null
			: baseDirPath
	);

	if (collectedDependencies[pkg.id]) {
		return;
	}

	collectedDependencies[pkg.id] = pkg;

	let dependencies = packageJson.dependencies || {};
	dependencies = Object.keys(dependencies);
	dependencies = dependencies.concat(extraDependencies);

	const dependencyDirs = dependencies
		.filter(
			(dependency) =>
				!project.presetInfo.isAutopreset ||
				dependency !== project.presetInfo.name
		)
		.map((dependency) =>
			resolveDependencyDir(baseDirPath, packageJson, dependency)
		)
		.filter(
			(dependencyDir) =>
				dependencyDir !== null && dependencyDir !== undefined
		);

	dependencyDirs.forEach((dependencyDir) => {
		addPackageDependencies(collectedDependencies, dependencyDir);
	});

	return collectedDependencies;
}

/**
 * Resolves a dependency package and returns its directory.
 * @param {String} packageDir the base directory used for resolution
 * @param {Object} packageJson the package.json object
 * @param {String} dependency a package name
 * @return {String} the path of the directory containing the dependency package
 */
function resolveDependencyDir(packageDir, packageJson, dependency) {
	try {
		const pkgJsonFile = resolveModule.sync(dependency + '/package.json', {
			basedir: packageDir,
		});

		return path.dirname(pkgJsonFile);
	}
	catch (err) {
		if (
			packageJson.optionalDependencies &&
			packageJson.optionalDependencies[dependency]
		) {
			report.warn(
				`Optional dependency '${dependency}' of ` +
					`'${packageJson.name}' could not be found in ` +
					`node_modules: it will be missing in the output bundle.`
			);

			return null;
		}
		else {
			throw err;
		}
	}
}
