import fs from 'fs';
import path from 'path';
import readJsonSync from 'read-json-sync';

/**
 * @return {void}
 */
export default function({pkg}, {pkgJson}) {
	if (pkg.name !== '@angular/forms') {
		return;
	}

	pkgJson.dependencies = pkgJson.dependencies || {};

	if (!pkgJson.dependencies['rxjs']) {
		const nodeModulesDir = path.resolve(path.join(pkg.dir, '..'));

		for (let dir of fs.readdirSync(nodeModulesDir)) {
			if (dir.startsWith('rxjs@')) {
				const rxjsPkgJson = readJsonSync(
					path.join(nodeModulesDir, dir, 'package.json')
				);

				pkgJson.dependencies['rxjs'] = rxjsPkgJson.version;

				break;
			}
		}
	}
}
