import fs from 'fs';
import path from 'path';

let packageDirCache = {};

/**
 * Get the full path of the package.json file for a given JS module file.
 * @param {String} modulePath the relative or absolute path to a JS module file
 * @return {String} the full path to the package.json file
 */
export function getPackageJsonPath(modulePath) {
	return `${getPackageDir(modulePath)}/package.json`;
}

/**
 * Get the full path of the package directory for a given JS module file.
 * @param {String} modulePath the relative or absolute path to a JS module file
 * @return {String} the full path to the package directory
 */
export function getPackageDir(modulePath) {
	let dir = packageDirCache[modulePath];

	if (!dir) {
		dir = path.resolve(modulePath);
		let found = false;

		while (!found) {
			try {
				fs.statSync(`${dir}${path.sep}/package.json`);
				found = true;
			} catch (err) {
				const dirname = path.dirname(dir);

				if (dirname == dir) {
					throw new Error(
						'Cannot find package.json for file: ' + modulePath,
					);
				}

				dir = dirname;
			}
		}

		packageDirCache[modulePath] = dir;
	}

	return dir;
}
