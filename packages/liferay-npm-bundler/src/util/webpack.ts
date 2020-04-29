/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import FilePath from 'liferay-npm-build-tools-common/lib/file-path';

/**
 * Remove a webpack hash (a hex number surrounded by dots near the end of the
 * file name) if present from a file path.
 */
export function removeWebpackHash(file: FilePath): FilePath {
	const filePosixPathParts = file.asPosix.split('.');

	let hashIndex;

	for (
		hashIndex = filePosixPathParts.length - 1;
		hashIndex >= 0;
		hashIndex--
	) {
		const filePosixPathPart = filePosixPathParts[hashIndex];

		if (filePosixPathPart.match(/^[0-9a-fA-F]+$/)) {
			break;
		}
	}

	if (hashIndex === -1) {
		return file;
	}

	filePosixPathParts.splice(hashIndex, 1);

	return new FilePath(filePosixPathParts.join('.'), {posix: true});
}
