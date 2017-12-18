import fs from 'fs';
import path from 'path';

let packageDirCache = {};

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
	let absModulePath = path.resolve(modulePath);
	let dir = packageDirCache[absModulePath];

	if (!dir) {
		dir = absModulePath;
		let found = false;

		while (!found) {
			try {
				fs.statSync(path.join(dir, 'package.json'));
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
