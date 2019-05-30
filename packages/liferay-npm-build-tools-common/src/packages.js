/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import path from 'path';
import readJsonSync from 'read-json-sync';

const packageDirCache = {};

/**
 * Get the full path of the package.json file for a given JS module file.
 * @param {String} modulePath the relative or absolute path to a JS module file
 * @return {String} the full path to the package.json file (with native path
 *         separators)
 */
export function getPackageJsonPath(modulePath) {
	return path.join(getPackageDir(modulePath), 'package.json');
}

/**
 * Get the full path of the package directory for a given JS module file.
 * @param {String} modulePath the relative or absolute path to a JS module file
 * @return {String} the full path to the package directory (with native path
 *         separators)
 */
export function getPackageDir(modulePath) {
	const absModulePath = path.resolve(modulePath);
	let dir = packageDirCache[absModulePath];

	if (!dir) {
		dir = absModulePath;
		let found = false;

		while (!found) {
			try {
				const pkgJsonPath = path.join(dir, 'package.json');

				fs.statSync(pkgJsonPath);

				const {version} = readJsonSync(pkgJsonPath);

				if (version === undefined) {
					throw new Error('No valid version field found');
				}

				found = true;
			} catch (err) {
				const dirname = path.dirname(dir);

				if (dirname == dir) {
					throw new Error(
						'Cannot find package.json for file: ' + modulePath
					);
				}

				dir = dirname;
			}
		}

		packageDirCache[absModulePath] = dir;
	}

	return dir;
}

/**
 * Converts a package name (optionally versioned) to its target folder name
 * inside bundled node_modules.
 * @param  {String} name a package name
 * @param  {String} [version=null] an optional package version
 * @return {String} the target folder
 */
export function getPackageTargetDir(name, version = null) {
	let targetFolder = name.replace('/', '%2F');

	if (version) {
		targetFolder += `@${version}`;
	}

	return targetFolder;
}

/**
 * Resolves a module name inside a package directory to a file relative (to
 * package directory) path.
 * For example, if you pass './lib' as moduleName and there's an 'index.js' file
 * inside the 'lib' dir, the method returns './lib/index.js'.
 * It also honors any 'package.json' with a 'main' entry in package subfolders.
 * @param  {String} pkgDir path to package directory
 * @param  {String} moduleName the module name
 * @return {String} a relative path
 */
export function resolveModuleFile(pkgDir, moduleName) {
	let fullModulePath = path.resolve(
		path.join(pkgDir, ...moduleName.split('/'))
	);
	let moduleStats = safeStat(fullModulePath);

	if (moduleStats.isDirectory()) {
		// Given module name is a directory
		const pkgJsonPath = path.join(fullModulePath, 'package.json');
		const pkgJsonStats = safeStat(pkgJsonPath);

		if (pkgJsonStats.isFile()) {
			// Module directory has package.json file
			const pkgJson = readJsonSync(pkgJsonPath);
			const {main} = pkgJson;

			if (main) {
				// Module directory has package.json file with main entry:
				// recursively resolve the main entry's file path
				fullModulePath = path.join(
					pkgDir,
					resolveModuleFile(pkgDir, path.join(moduleName, main))
				);
			} else {
				// Module directory has package.json file without main entry:
				// assume index.js
				fullModulePath = path.join(fullModulePath, 'index.js');
			}
		} else {
			// Module directory has not package.json file: assume index.js
			fullModulePath = path.join(fullModulePath, 'index.js');
		}
	} else if (moduleStats.isFile()) {
		// Given module name is a file: do nothing
	} else if (fullModulePath.endsWith('.js')) {
		// Given module name is not a directory nor a file but ends with '.js'
		// extension: see if corresponding '.js.js' file exists
		moduleStats = safeStat(`${fullModulePath}.js`);

		if (moduleStats.isFile()) {
			// Given module name has a corresponding '.js.js' file: add '.js'
			// extension
			fullModulePath += '.js';
		} else {
			// Given module name has no corresponding '.js.js' file: do nothing
			// and assume that the '.js' in the module name is just the
			// extension of the file and doesn't belong to its name.
		}
	} else {
		// Given module name is not a directory nor a file and doesn't end with
		// '.js' extension: add '.js' extension
		fullModulePath += '.js';
	}

	return path.relative(pkgDir, fullModulePath);
}

/**
 * Do as fs.statSync without throwing errors.
 * @param  {String} path path to check
 * @return {fs.Stats} a real fs.Stats object or a null object
 */
function safeStat(path) {
	try {
		return fs.statSync(path);
	} catch (err) {
		return {
			isDirectory: () => false,
			isFile: () => false,
		};
	}
}
