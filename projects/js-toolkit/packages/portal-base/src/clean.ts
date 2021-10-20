/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath, format} from '@liferay/js-toolkit-core';
import fs from 'fs';
import project from 'liferay-npm-build-tools-common/lib/project';

const {print, success} = format;

const buildDir = new FilePath(project.buildDir.asNative);
const distDir = new FilePath(project.jar.outputDir.asNative);

export default async function clean(): Promise<void> {
	if (fs.existsSync(buildDir.asNative)) {
		fs.rmdirSync(buildDir.asNative, {recursive: true});
	}

	if (fs.existsSync(distDir.asNative)) {
		fs.rmdirSync(distDir.asNative, {recursive: true});
	}

	print(success`{Removed output directories}`);
}
