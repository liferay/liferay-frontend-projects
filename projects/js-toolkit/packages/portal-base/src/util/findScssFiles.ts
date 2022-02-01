/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, Project} from '@liferay/js-toolkit-core';

import findFiles from '../util/findFiles';

export default function findScssFiles(project: Project): FilePath[] {
	return findFiles(project.assetsDir, (dirent) => {
		const lowerCaseName = dirent.name.toLowerCase();

		return (
			lowerCaseName.endsWith('.scss') && !lowerCaseName.startsWith('_')
		);
	});
}
