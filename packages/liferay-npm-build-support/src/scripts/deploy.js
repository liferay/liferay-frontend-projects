/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';
import fs from 'fs';
import readJsonSync from 'read-json-sync';

import * as cfg from '../config';

/**
 *
 */
export default function() {
	const projectDir = cfg.getProjectDir();
	const outputDir = cfg.getOutputDir();
	const liferayDir = cfg.getLiferayDir();

	const pkgJson = readJsonSync(path.join(projectDir, 'package.json'));

	let jarName = cfg.getOutputFilename();

	if (!jarName) {
		jarName = pkgJson.name + '-' + pkgJson.version + '.jar';
	}

	fs.copyFileSync(
		path.join(outputDir, jarName),
		path.join(liferayDir, 'osgi', 'modules', jarName)
	);

	console.log(`Deployed ${jarName} to ${liferayDir}`);
}
