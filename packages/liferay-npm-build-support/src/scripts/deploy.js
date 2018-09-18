import path from 'path';
import fs from 'fs';
import readJsonSync from 'read-json-sync';

import * as cfg from '../config';

/**
 *
 */
export default function() {
	const projectDir = cfg.getProjectDir();
	const liferayDir = cfg.getLiferayDir();

	const pkgJson = readJsonSync(`${projectDir}/package.json`);
	const jarName = pkgJson.name + '-' + pkgJson.version + '.jar';

	fs.copyFileSync(
		path.join('build', jarName),
		path.join(liferayDir, 'osgi', 'modules', jarName)
	);

	console.log(`Deployed ${jarName} to ${liferayDir}`);
}
