/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {addNamespace} = require('@liferay/js-toolkit-core');
const fs = require('fs');
const path = require('path');

const getBridgeExportName = require('../utils/getBridgeExportName');

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

function getMainModuleFileName(packageJson) {
	let {main: moduleFileName} = packageJson;

	moduleFileName = moduleFileName || 'index.js';
	moduleFileName = moduleFileName.replace(/^\.\//, '');

	if (!moduleFileName.toLowerCase().endsWith('.js')) {
		moduleFileName += '.js';
	}

	return moduleFileName;
}

function getNamespacedVersionedPackageName(projectPackageJson, packageJson) {
	if (projectPackageJson.name === packageJson.name) {
		return `${packageJson.name}@${packageJson.version}`;
	}
	else {
		return addNamespace(
			`${packageJson.name}@${packageJson.version}`,
			projectPackageJson
		);
	}
}

function writeBridge(packageDir, projectPackageJson, packageJson) {
	const moduleFileName = getMainModuleFileName(packageJson);

	fs.mkdirSync(path.join(packageDir, path.dirname(moduleFileName)), {
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
