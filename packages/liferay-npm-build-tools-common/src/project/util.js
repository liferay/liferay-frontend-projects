/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import fs from 'fs';
import path from 'path';

/**
 *
 * @param {Project} project
 * @param {string} featuresKey
 * @param {string} defaultValue a path (relative to project root) using /
 * 					separator (it will be translated to the correct platform
 * 					separator by the function itself)
 * @return {string|undefined}
 */
export function getFeaturesFilePath(project, featuresKeyPath, defaultValue) {
	const {_npmbundlerrc, _projectDir} = project;

	const filePath = prop.get(_npmbundlerrc, featuresKeyPath);

	if (filePath !== undefined) {
		return path.resolve(_projectDir, filePath);
	}

	const defaultFilePath = path.join(_projectDir, ...defaultValue.split('/'));

	if (fs.existsSync(defaultFilePath)) {
		return defaultFilePath;
	}

	return undefined;
}

/**
 * Inject an `asPlatform` read only property in the given array which returns
 * its items as platform path (i.e.: substituting each appearance of `/` by the
 * platform's `path.sep`).
 * @param {Array<string>} posixPathsArray
 */
export function mixinAsPlatform(posixPathsArray) {
	Object.defineProperty(posixPathsArray, 'asPlatform', {
		configurable: false,
		enumerable: true,
		get: () =>
			posixPathsArray.map(posixPath =>
				posixPath.replace(/\//g, path.sep)
			),
	});
}
