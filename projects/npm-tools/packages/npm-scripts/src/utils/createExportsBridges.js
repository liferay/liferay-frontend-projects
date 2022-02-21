/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable @liferay/no-dynamic-require */

const {
	addNamespace,
	joinModuleName,
	splitModuleName,
} = require('@liferay/js-toolkit-core');
const fs = require('fs');
const path = require('path');
const resolve = require('resolve');

/**
 * Create .js files to make Liferay-AMD modules available as browser ESM
 * modules.
 *
 * @param {string} projectDir path to project's directory
 * @param {string} outDir path to output directory
 * @param {object} exportsMap
 * Map of ESM exports, where keys are bare identifiers, and values are a valid
 * npm module path.
 */
function createExportsBridges(projectDir, outDir, exportsMap) {
	Object.entries(exportsMap).forEach(([bareIdentifier, moduleName]) => {
		const {modulePath, pkgName, scope} = splitModuleName(moduleName);

		const rootPkgJson = require(path.join(projectDir, 'package.json'));
		const pkgJson = require(resolve.sync(
			joinModuleName(scope, pkgName, '/package.json'),
			{
				basedir: projectDir,
			}
		));

		const nsModuleName = addNamespace(
			joinModuleName(
				scope,
				`${pkgJson.name}@${pkgJson.version}`,
				modulePath
			),
			rootPkgJson
		);

		const module = require(resolve.sync(moduleName, {basedir: projectDir}));
		const fields = Object.keys(module)
			.filter((field) => field !== 'default')
			.map((field) => `	${field}`)
			.join(',\n');

		let bridgeSource = `
const amdModule = await new Promise((resolve, reject) => {
	Liferay.Loader.require(
		'${nsModuleName}',
		resolve,
		reject
	);
});
`;

		if (fields.length) {
			bridgeSource += `
const {
${fields}
} = amdModule;

export {
${fields}
};
`;
		}

		bridgeSource += `
export default amdModule;
`;

		const bridgePath = path.join(
			outDir,
			'__liferay__',
			'amd2esm',
			`${bareIdentifier}.js`
		);

		fs.mkdirSync(path.dirname(bridgePath), {recursive: true});

		fs.writeFileSync(bridgePath, bridgeSource);
	});
}

module.exports = createExportsBridges;
