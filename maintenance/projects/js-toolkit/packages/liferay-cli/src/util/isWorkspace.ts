/**
 * SPDX-FileCopyrightText: © 2023 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import path from 'path';

export default function isWorkspace(): boolean {
	let isWorkspace = false;
	let dir = process.cwd();

	while (!isWorkspace) {
		try {
			isWorkspace = fs
				.readFileSync(path.join(dir, 'settings.gradle'), 'utf-8')
				.includes('"com.liferay.gradle.plugins.workspace"');
		}
		catch (error) {

			// ignore

		}

		const newDir = path.dirname(dir);

		if (newDir === dir) {
			break;
		}

		dir = newDir;
	}

	return isWorkspace;
}
