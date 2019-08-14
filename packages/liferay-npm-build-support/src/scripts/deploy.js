/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import fs from 'fs';
import project from 'liferay-npm-build-tools-common/lib/project';

import * as cfg from '../config';

/**
 *
 */
export default function() {
	const liferayDir = cfg.getLiferayDir();

	const outputDir = project.jar.outputDir;
	const jarName = project.jar.outputFilename;

	fs.copyFileSync(
		path.join(outputDir, jarName),
		path.join(liferayDir, 'osgi', 'modules', jarName)
	);

	console.log(`Deployed ${jarName} to ${liferayDir}`);
}
