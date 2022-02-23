/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

module.exports = function flattenPkgName(pkgName) {
	return pkgName.replace(/\//g, '$');
};
