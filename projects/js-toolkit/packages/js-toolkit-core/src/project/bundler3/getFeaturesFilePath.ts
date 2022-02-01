/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import fs from 'fs';

import FilePath from '../../file/FilePath';
import Project from './Project';

/**
 *
 * @param project
 * @param featuresKey
 * @param defaultPrjRelPosixPath a posix path relative to project root
 * @return absolute path to features file
 */
export function getFeaturesFilePath(
	project: Project,
	featuresKeyPath: string,
	defaultPrjRelPosixPath: string
): string | undefined {
	const {configuration, dir: projectDir} = project;

	const prjRelPosixPath: string = prop.get(configuration, featuresKeyPath);

	if (prjRelPosixPath !== undefined) {
		return projectDir.join(new FilePath(prjRelPosixPath, {posix: true}))
			.asNative;
	}

	const defaultAbsPath = projectDir.join(
		new FilePath(defaultPrjRelPosixPath, {posix: true})
	).asNative;

	if (fs.existsSync(defaultAbsPath)) {
		return defaultAbsPath;
	}

	return undefined;
}
