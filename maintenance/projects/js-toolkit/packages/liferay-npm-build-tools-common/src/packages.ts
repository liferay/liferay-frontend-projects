/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import path from 'path';
import readJsonSync from 'read-json-sync';

/** A null object pattern for {@link fs.Stats} object */
interface NullFsStats {
	isDirectory: () => boolean;
	isFile: () => boolean;
}

/**
 * Converts a package name (optionally versioned) to its target folder name
 * inside bundled node_modules.
 * @param name a package name
 * @param version an optional package version
 * @return the target folder
 */
export function getPackageTargetDir(
	name: string,
	version: string = null
): string {
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
 * @param pkgPath path to package directory
 * @param moduleName the module name
 * @return a path relative to pkgDir
 */
export function resolveModuleFile(pkgPath: string, moduleName: string): string {
	let fullModulePath = path.resolve(
		path.join(pkgPath, ...moduleName.split('/'))
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
					pkgPath,
					resolveModuleFile(pkgPath, path.join(moduleName, main))
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

	return path.relative(pkgPath, fullModulePath);
}

/**
 * Do as fs.statSync without throwing errors.
 * @param path path to check
 * @return {fs.Stats} a real fs.Stats object or a null object
 */
function safeStat(path: string): fs.Stats | NullFsStats {
	try {
		return fs.statSync(path);
	} catch (err) {
		return {
			isDirectory: () => false,
			isFile: () => false,
		};
	}
}
