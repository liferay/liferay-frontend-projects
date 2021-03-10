/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const getProjectMainModuleFilePath = require('../utils/getProjectMainModuleFilePath');
const {addNamespace} = require('./bundlerNamespace');
const getNamespacedVersionedPackageName = require('./getNamespacedVersionedPackageName');
const writeBridge = require('./writeBridge');

/**
 * Create bundler modules that re-export webpack ones.
 *
 * @param {string[]|undefined} bridges
 * An array containing the names of the packages that must be re-exported
 * through the AMD loader or undefined if no bridges are needed.
 *
 * @param {string} dir
 * The path to the directory where bridge files should be written.
 *
 * @return {void}
 */
module.exports = function (bridges, dir) {

	// If bridges is undefined or false, do nothing

	if (!bridges) {
		return;
	}

	/* eslint-disable-next-line @liferay/liferay/no-dynamic-require */
	const projectPackageJson = require(path.resolve('package.json'));

	// Write a bridge for the main module (if it exists)

	const projectMainModuleFilePath = getProjectMainModuleFilePath();

	if (fs.existsSync(projectMainModuleFilePath)) {
		writeBridge(dir, projectPackageJson);
	}

	// Write bridges for exported dependencies

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
					name: addNamespace(
						packageJson.name,
						projectPackageJson.name
					),
				},
				null,
				'\t'
			)
		);

		writeBridge(packageDir, projectPackageJson, packageJson);
	}
};
