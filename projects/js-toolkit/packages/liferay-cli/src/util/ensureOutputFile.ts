/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath} from '@liferay/js-toolkit-core';
import fs from 'fs';

/**
 * Ensure a project's output file exists and return its FilePath.
 *
 * @param options The generation options
 * @param projectPosixRelativePath
 */
export default function ensureOutputFile(
	options: {outputPath: FilePath},
	projectPosixRelativePath: string
): FilePath {
	const file = options.outputPath.join(
		new FilePath(projectPosixRelativePath, {posix: true})
	);

	if (!fs.existsSync(file.asNative)) {
		fs.mkdirSync(file.dirname().asNative, {recursive: true});

		const filePath = file.asNative;
		let content = '';

		if (filePath.endsWith('.json')) {
			content = '{}';
		}

		fs.writeFileSync(filePath, content);
	}

	return file;
}
