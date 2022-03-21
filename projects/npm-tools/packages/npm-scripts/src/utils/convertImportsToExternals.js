/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const flattenPkgName = require('./flattenPkgName');

module.exports = function convertImportsToExternals(imports, backDirCount) {
	return Object.entries(imports).reduce((externals, [provider, packages]) => {
		let backDirs = '';

		for (let i = 0; i < backDirCount; i++) {
			backDirs += '../';
		}

		const webContextPath = provider.startsWith('@liferay')
			? provider.split('/')[1]
			: provider;

		externals[
			provider
		] = `${backDirs}${webContextPath}/__liferay__/index.js`;

		packages.forEach((pkgName) => {
			externals[
				pkgName
			] = `${backDirs}${provider}/__liferay__/exports/${flattenPkgName(
				pkgName
			)}.js`;
		});

		return externals;
	}, {});
};
