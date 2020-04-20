/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import globby from 'globby';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import path from 'path';

/**
 * Copy files matching globs.
 *
 * Note that the globs are not altered in any way and may even point to files
 * outside of the project directory.
 *
 * @param baseDirPath a native directory path
 * @param globs
 * globs in `globby` format (may include `.` and `..` but must be in POSIX
 * format, i.e.: use `/` path separator)
 * @param destDirPath a native directory path
 */
export function copyFiles(
	baseDirPath: string | FilePath,
	globs: string[],
	destDirPath: string | FilePath
): FilePath[] {
	const files = findFiles(baseDirPath, globs);

	files.forEach(file =>
		fs.copySync(
			path.join(baseDirPath.toString(), file.asNative),
			path.join(destDirPath.toString(), file.asNative)
		)
	);

	return files;
}

/**
 * Perform a glob search of files and return their paths referenced to
 * `baseDir` without leading `./`.
 *
 * Note that the globs are not altered in any way and may even point to files
 * outside of the project directory.
 *
 * @param baseDirPath a native directory path
 * @param globs
 * globs in `globby` format (may include `.` and `..` but must be in POSIX
 * format, i.e.: use `/` path separator)
 * @return an array containing FilePaths relative to `baseDirPath`
 */
export function findFiles(
	baseDirPath: string | FilePath,
	globs: string[]
): FilePath[] {
	return globby
		.sync(globs, {
			absolute: true,
			cwd: baseDirPath.toString(),
			followSymbolicLinks: false,
			onlyFiles: true,
		})
		.map(absPath => path.relative(baseDirPath.toString(), absPath))
		.map(baseDirRelPath => new FilePath(baseDirRelPath, {posix: true}));
}
