/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const flattenPkgName = require('./flattenPkgName');

module.exports = function convertImportsToExternals(imports) {
	return Object.entries(imports).reduce((externals, [provider, packages]) => {
		packages.forEach((pkgName) => {
			const flatPkgName = flattenPkgName(pkgName);

			externals[
				pkgName
			] = `../../../${provider}/__liferay__/exports/${flatPkgName}.js`;
		});

		return externals;
	}, {});
};
