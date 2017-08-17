import fs from 'fs';
import readJsonSync from 'read-json-sync';

/**
 * @return {void}
 */
export default function({ pkg, config }, { pkgJson }) {
	if (pkg.name !== '@angular/forms') {
		return;
	}

	pkgJson.dependencies = pkgJson.dependencies || {};

	if (!pkgJson.dependencies['rxjs']) {
		const nodeModulesDir = fs.realpathSync(`${pkg.dir}/..`);

		for (let dir of fs.readdirSync(nodeModulesDir)) {
			if (dir.startsWith('rxjs@')) {
				const rxjsPkgJson = readJsonSync(
					`${nodeModulesDir}/${dir}/package.json`,
				);

				pkgJson.dependencies['rxjs'] = rxjsPkgJson.version;

				break;
			}
		}
	}
}
