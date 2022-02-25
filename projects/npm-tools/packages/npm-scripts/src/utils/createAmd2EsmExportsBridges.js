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
function createAmd2EsmExportsBridges(projectDir, outDir, exportsMap) {
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

		let source = '';

		source +=
			'const amdModule = await new Promise((resolve, reject) => {\n';
		source += `	Liferay.Loader.require('${nsModuleName}', resolve, reject);\n`;
		source += '});\n';

		const module = require(resolve.sync(moduleName, {basedir: projectDir}));

		const nonDefaultFields = Object.keys(module)
			.filter((field) => field !== 'default')
			.map((field) => `	${field}`)
			.join(',\n');

		// Extract relevant values from AMD module

		if (nonDefaultFields.length) {
			source += 'const {\n';
			source += `${nonDefaultFields}\n`;
			source += '} = amdModule;\n';
		}

		// Export named values

		source += 'const __esModule = true;\n';
		source += 'export {\n';
		source += '	__esModule,\n';

		if (nonDefaultFields.length) {
			source += `${nonDefaultFields}\n`;
		}

		source += '};\n';

		// Export default value

		source += `export default amdModule;\n`;

		// Write the file

		const bridgePath = path.join(
			outDir,
			'__liferay__',
			'exports',
			`${bareIdentifier}.js`
		);

		fs.mkdirSync(path.dirname(bridgePath), {recursive: true});

		fs.writeFileSync(bridgePath, source);
	});
}

module.exports = createAmd2EsmExportsBridges;
