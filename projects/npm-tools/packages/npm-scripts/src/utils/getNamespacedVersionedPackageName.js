/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {addNamespace} = require('./bundlerNamespace');

/**
 * Get the namespaced and versioned package name of a project's dependency as it
 * would be exported by the bundler.
 *
 * @param {object} projectPackageJson the parsed `package.json` of the project
 * @param {object} [packageJson]
 * The parsed `package.json` file of the dependency or undefined to get the
 * project's versioned package name.
 *
 * @return {string}
 * A string like `frontend-js-webd$react@16.12.0`
 */
module.exports = function (projectPackageJson, packageJson) {
	if (packageJson) {
		const namespacedName = addNamespace(
			packageJson.name,
			projectPackageJson.name
		);

		return `${namespacedName}@${packageJson.version}`;
	}
	else {
		return `${projectPackageJson.name}@${projectPackageJson.version}`;
	}
};
