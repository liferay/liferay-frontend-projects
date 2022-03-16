/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const flattenPkgName = require('./flattenPkgName');

module.exports = function convertImportsToExternals(imports, backDirCount) {
	return Object.entries(imports).reduce((externals, [provider, packages]) => {
		packages.forEach((pkgName) => {
			const flatPkgName = flattenPkgName(pkgName);

			let backDirs = '';

			for (let i = 0; i < backDirCount; i++) {
				backDirs += '../';
			}

			externals[
				pkgName
			] = `${backDirs}${provider}/__liferay__/exports/${flatPkgName}.js`;
		});

		return externals;
	}, {});
};
