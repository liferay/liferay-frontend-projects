/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {addNamespace} = require('@liferay/js-toolkit-core');
const fs = require('fs');
const path = require('path');

module.exports = function (bridges, dir) {
	const projectPackageJson = JSON.parse(
		fs.readFileSync('package.json', 'utf8')
	);

	for (const [packageName, exportName] of Object.entries(bridges)) {
		const packageJson = JSON.parse(
			fs.readFileSync(
				require.resolve(`${packageName}/package.json`),
				'utf8'
			)
		);

		const namespacedVersionedPackageName = addNamespace(
			`${packageJson.name}@${packageJson.version}`,
			projectPackageJson
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

		let {main: moduleFileName} = packageJson;

		moduleFileName = moduleFileName || 'index.js';
		moduleFileName = moduleFileName.replace(/^\.\//, '');

		if (!moduleFileName.toLowerCase().endsWith('.js')) {
			moduleFileName += '.js';
		}

		fs.mkdirSync(path.join(packageDir, path.dirname(moduleFileName)), {
			recursive: true,
		});

		const moduleName = moduleFileName.replace(/\.js$/i, '');

		fs.writeFileSync(
			path.join(packageDir, moduleFileName),
			`
(function() {
	const getModule = window[Symbol.for('__LIFERAY_WEBPACK_GET_MODULE__')];

	getModule('${projectPackageJson.name}').then(
		function({${exportName}}) {
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
};
