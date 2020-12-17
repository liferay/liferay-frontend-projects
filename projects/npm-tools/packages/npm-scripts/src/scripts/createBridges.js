/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {addNamespace} = require('@liferay/js-toolkit-core');
const fs = require('fs');
const path = require('path');

const getBridgeExportName = require('../utils/getBridgeExportName');

/**
 * Create bundler modules that re-export webpack ones.
 *
 * @param {string[]} bridges
 * An array containing the names of the packages that must be re-exported
 * through the AMD loader.
 *
 * @param {string} dir
 * The path to the directory where bridge files should be written.
 *
 * @return {void}
 */
module.exports = function (bridges, dir) {
	const projectPackageJson = JSON.parse(
		fs.readFileSync('package.json', 'utf8')
	);

	writeBridge(dir, projectPackageJson, projectPackageJson);

	for (const packageName of bridges) {
		const packageJson = JSON.parse(
			fs.readFileSync(
				require.resolve(`${packageName}/package.json`),
				'utf8'
			)
		);

		const namespacedVersionedPackageName = getNamespacedVersionedPackageName(
			projectPackageJson,
			packageJson
		);

		const packageDir = path.join(
			dir,
			'node_modules',
			namespacedVersionedPackageName.replace('/', '%2F')
		);

		fs.mkdirSync(packageDir, {recursive: true});

		fs.writeFileSync(
			path.join(packageDir, 'package.json'),
			JSON.stringify(
				{
					...packageJson,
					name: addNamespace(packageJson.name, projectPackageJson),
				},
				null,
				'\t'
			)
		);

		writeBridge(packageDir, projectPackageJson, packageJson);
	}
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

/**
 * Get the namespaced and versioned package name of a project's dependency as it
 * would be exported by the bundler.
 *
 * @param {object} projectPackageJson the parsed `package.json` of the project
 * @param {object} packageJson the parsed `package.json` file of the dependency
 *
 * @return {string}
 * A string like `frontend-js-webd$react@16.12.0`
 */
function getNamespacedVersionedPackageName(projectPackageJson, packageJson) {
	if (projectPackageJson.name === packageJson.name) {
		return `${packageJson.name}@${packageJson.version}`;
	} else {
		return addNamespace(
			`${packageJson.name}@${packageJson.version}`,
			projectPackageJson
		);
	}
}

/**
 * Write a bridge file for a given project dependency package.
 *
 * @param {string} dir the output directory
 * @param {object} projectPackageJson the parsed `package.json` of the project
 * @param {object} packageJson the parsed `package.json` file of the dependency
 *
 * @return {void}
 */
function writeBridge(dir, projectPackageJson, packageJson) {
	const moduleFileName = getMainModuleFileName(packageJson);

	fs.mkdirSync(path.join(dir, path.dirname(moduleFileName)), {
		recursive: true,
	});

	const exportName = getBridgeExportName(packageJson.name);
	const exportExpression =
		projectPackageJson.name === packageJson.name
			? exportName
			: `{${exportName}}`;
	const moduleName = moduleFileName.replace(/\.js$/i, '');
	const namespacedVersionedPackageName = getNamespacedVersionedPackageName(
		projectPackageJson,
		packageJson
	);

	fs.writeFileSync(
		path.join(packageDir, moduleFileName),
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
}
