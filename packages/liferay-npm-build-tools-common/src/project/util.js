/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import fs from 'fs';

import FilePath from '../file-path';

/**
 *
 * @param {Project} project
 * @param {string} featuresKey
 * @param {string} defaultPrjRelPosixPath a posix path relative to project root
 * @return {string|undefined} absolute path to features file
 */
export function getFeaturesFilePath(
	project,
	featuresKeyPath,
	defaultPrjRelPosixPath
) {
	const {_npmbundlerrc, _projectDir} = project;

	const prjRelPosixPath = prop.get(_npmbundlerrc, featuresKeyPath);

	if (prjRelPosixPath !== undefined) {
		return _projectDir.join(new FilePath(prjRelPosixPath, {posix: true}))
			.asNative;
	}

	const defaultAbsPath = _projectDir.join(
		new FilePath(defaultPrjRelPosixPath, {posix: true})
	).asNative;

	if (fs.existsSync(defaultAbsPath)) {
		return defaultAbsPath;
	}

	return undefined;
}
