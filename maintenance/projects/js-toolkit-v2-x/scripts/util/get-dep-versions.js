/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const globby = require('globby');

function getDepVersions() {
	const filePaths = globby.sync(['packages/*/package.json']);

	const pkgJsons = filePaths.map((filePath) =>
		JSON.parse(fs.readFileSync(filePath))
	);

	const depVersions = {};

	pkgJsons.forEach((pkgJson) => {
		['dependencies', 'devDependencies'].forEach((scope) => {
			Object.entries(pkgJson[scope] || {}).forEach(([dep, version]) => {
				const versions = depVersions[dep] || {};

				versions[version] = versions[version] || [];

				versions[version].push(pkgJson.name);

				depVersions[dep] = versions;
			});
		});
	});

	return depVersions;
}

module.exports = getDepVersions;
