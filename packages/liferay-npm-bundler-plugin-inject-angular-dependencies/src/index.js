import fs from 'fs';
import {getPackageTargetDir} from 'liferay-npm-build-tools-common/lib/packages';
import path from 'path';
import readJsonSync from 'read-json-sync';

const dependenciesMap = {
	'@angular/forms': ['rxjs'],
	'@angular/platform-browser': ['@angular/animations'],
};

/**
 * @return {void}
 */
export default function({pkg, config}, {pkgJson}) {
	const deps = Object.assign(
		{},
		dependenciesMap,
		config.dependenciesMap || {}
	)[pkg.name];

	if (!deps) {
		return;
	}

	pkgJson.dependencies = pkgJson.dependencies || {};

	deps.forEach(dep => {
		let dirPrefix;

		if (dep.indexOf('/') != -1) {
			dirPrefix = `${getPackageTargetDir(dep)}@`;
		} else {
			dirPrefix = `${dep}@`;
		}

		if (!pkgJson.dependencies[dep]) {
			const nodeModulesDir = path.resolve(path.join(pkg.dir, '..'));

			for (let dir of fs.readdirSync(nodeModulesDir)) {
				if (dir.startsWith(dirPrefix)) {
					const depPkgJson = readJsonSync(
						path.join(nodeModulesDir, dir, 'package.json')
					);

					pkgJson.dependencies[dep] = depPkgJson.version;

					break;
				}
			}
		}
	});
}
