/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath} from '@liferay/js-toolkit-core';
import fs, {Dirent} from 'fs';

export default function findFiles(
	dir: FilePath,
	condition: {(dirent: Dirent): boolean}
): FilePath[] {
	return fs
		.readdirSync(dir.asNative, {withFileTypes: true})
		.reduce((files, dirent) => {
			if (dirent.isDirectory()) {
				files.push(...findFiles(dir.join(dirent.name), condition));
			}
			else if (dirent.isFile() && condition(dirent)) {
				files.push(dir.join(dirent.name));
			}

			return files;
		}, []);
}
