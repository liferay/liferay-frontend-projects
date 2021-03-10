/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const getBridgeExportName = require('./getBridgeExportName');
const getNamespacedVersionedPackageName = require('./getNamespacedVersionedPackageName');

/**
 * Write a bridge file for a given project dependency package.
 *
 * @param {string} dir the output directory
 * @param {object} projectPackageJson the parsed `package.json` of the project
 * @param {object} [packageJson]
 * The parsed `package.json` file of the dependency or undefined to generate a
 * bridge for the `main` module of the project.
 *
 * @return {void}
 */
module.exports = function (dir, projectPackageJson, packageJson) {
	const moduleFileName = getMainModuleFileName(
		packageJson || projectPackageJson
	);

	fs.mkdirSync(path.join(dir, path.dirname(moduleFileName)), {
		recursive: true,
	});

	const exportName = getBridgeExportName(
		packageJson ? packageJson.name : projectPackageJson.name
	);
	const exportExpression = packageJson ? `{${exportName}}` : exportName;
	const moduleName = moduleFileName.replace(/\.js$/i, '');
	const namespacedVersionedPackageName = getNamespacedVersionedPackageName(
		projectPackageJson,
		packageJson
	);

	fs.writeFileSync(
		path.join(dir, moduleFileName),
		`
(function() {
	const getModule = window[Symbol.for('__LIFERAY_WEBPACK_GET_MODULE__')];

	getModule('${projectPackageJson.name}').then(
		function(${exportExpression}) {
			Liferay.Loader.define(
				'${namespacedVersionedPackageName}/${moduleName}', ['module'],
				function (module) {
					module.exports = ${exportName};
				}
			);
		}
	);
})();
`
	);
};

/**
 * Get the file name of the `main` module of a `package.json` object.
 *
 * @param {object} packageJson a parsed `package.json` file
 *
 * @return {string}
 * The normalized path (no leading `./` and containing trailing file extension
 * `.js`) to the main module.
 *
 * If there's no `main` entry in the `package.json` file, `index.js` is assumed.
 */
function getMainModuleFileName(packageJson) {
	let {main: moduleFileName} = packageJson;

	moduleFileName = moduleFileName || 'index.js';
	moduleFileName = moduleFileName.replace(/^\.\//, '');

	if (!moduleFileName.toLowerCase().endsWith('.js')) {
		moduleFileName += '.js';
	}

	return moduleFileName;
}
