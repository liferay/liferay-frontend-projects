/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

import fs from 'fs';
import path from 'path';

import {getLiferayDir, project} from '../config';

/**
 *
 */
export default function (): void {
	const liferayDirPath = getLiferayDir();

	const outputDir = project.jar.outputDir;
	const jarName = project.jar.outputFilename;

	fs.copyFileSync(
		outputDir.join(jarName).asNative,
		path.join(liferayDirPath, 'osgi', 'modules', jarName)
	);

	console.log(`Deployed ${jarName} to ${liferayDirPath}`);
}
