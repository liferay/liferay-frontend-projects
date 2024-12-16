/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import project from 'liferay-npm-build-tools-common/lib/project';
import path from 'path';

import * as cfg from '../config';

/**
 *
 */
export default function () {
	const liferayDirPath = cfg.getLiferayDir();

	const outputDir = project.jar.outputDir;
	const jarName = project.jar.outputFilename;

	fs.copyFileSync(
		outputDir.join(jarName).asNative,
		path.join(liferayDirPath, 'osgi', 'modules', jarName)
	);

	console.log(`Deployed ${jarName} to ${liferayDirPath}`);
}
