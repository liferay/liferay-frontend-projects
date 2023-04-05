/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const TYPED_PACKAGES = ['react', 'react-dom'];

module.exports = function addTypeDependencies(packageJson) {
	if (!packageJson.dependencies) {
		return;
	}

	const {dependencies} = packageJson;

	const versions = {};

	TYPED_PACKAGES.forEach((packageName) => {
		versions[packageName] = dependencies[packageName];
	});

	Object.entries(versions).forEach(([packageName, version]) => {
		if (version) {
			dependencies[`@types/${packageName}`] = version;
		}
	});
};
