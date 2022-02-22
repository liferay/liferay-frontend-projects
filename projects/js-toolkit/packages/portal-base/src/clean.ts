/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Project, format} from '@liferay/js-toolkit-core';
import fs from 'fs';

const {print, success} = format;
const rmSync = fs['rmSync'] || fs.rmdirSync;

export default async function clean(): Promise<void> {
	const project = new Project('.');

	if (fs.existsSync(project.build.dir.asNative)) {
		rmSync(project.build.dir.asNative, {recursive: true});
	}

	if (fs.existsSync(project.dist.dir.asNative)) {
		rmSync(project.dist.dir.asNative, {recursive: true});
	}

	print(success`{Removed output directories}`);
}
