/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const path = require('path');

const getDepVersions = require('./util/get-dep-versions');

const argv = process.argv;

if (argv.length !== 4) {
	console.log('Usage: level-deps <package name> <desired version>');
	process.exit(2);
}

const dep = argv[2];
const version = argv[3];

const depVersions = getDepVersions();

Object.values(depVersions[dep]).forEach((prjs) => {
	console.log('Setting', dep, 'to version', version, 'in projects:');

	prjs.forEach((prj) => {
		const pkgJsonPath = path.join('packages', prj, 'package.json');

		const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath));

		console.log(`  ${prj}`);

		if (pkgJson.dependencies && pkgJson.dependencies[dep]) {
			pkgJson.dependencies[dep] = version;
		}
		else if (pkgJson.devDependencies && pkgJson.devDependencies[dep]) {
			pkgJson.devDependencies[dep] = version;
		}

		const pkgJsonContent = JSON.stringify(pkgJson, null, '	');

		fs.writeFileSync(pkgJsonPath, `${pkgJsonContent}\n`);
	});
});
