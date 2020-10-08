/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs');
const globby = require('globby');

function coalesceSnapshotVersions(versions) {
	const coalescedVersions = {};

	Object.keys(versions).forEach((version) => {
		const i = version.indexOf('-snapshot.');

		if (i != -1) {
			const refVersion = version.substring(0, i);

			coalescedVersions[refVersion] = coalescedVersions[refVersion] || [];
			coalescedVersions[refVersion].push(...versions[version]);
		}
		else {
			coalescedVersions[version] = coalescedVersions[version] || [];
			coalescedVersions[version].push(...versions[version]);
		}
	});

	return coalescedVersions;
}

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

module.exports = {
	coalesceSnapshotVersions,
	getDepVersions,
};
