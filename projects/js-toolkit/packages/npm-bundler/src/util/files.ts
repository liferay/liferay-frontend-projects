/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath} from '@liferay/js-toolkit-core';
import fs from 'fs-extra';
import globby from 'globby';
import path from 'path';

/**
 * A function to map a FilePath to another FilePath.
 */
export interface FilePathMapper {
	(file: FilePath): FilePath;
}

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
 * @return the copied destination file paths
 */
export function copyFiles(
	baseDirPath: string | FilePath,
	globs: string[],
	destDirPath: string | FilePath,
	mapper?: FilePathMapper
): FilePath[] {
	const baseDir = FilePath.coerce(baseDirPath);
	const destDir = FilePath.coerce(destDirPath);

	const files = findFiles(baseDirPath, globs);

	if (!mapper) {
		mapper = ((file) => file) as FilePathMapper;
	}

	return files.map((file) => {
		const destFile = mapper(destDir.join(file));

		fs.copySync(baseDir.join(file).asNative, destFile.asNative);

		return destFile;
	});
}

/**
 * Perform a glob search of files and return their paths relative to `baseDir`
 * without leading `./`.
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
		.map((absPath) => path.relative(baseDirPath.toString(), absPath))
		.map((baseDirRelPath) => new FilePath(baseDirRelPath, {posix: true}));
}
