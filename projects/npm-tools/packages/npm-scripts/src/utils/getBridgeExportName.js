/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Convert a package name into a valid JS variable to be used to represent it
 * in an import/export expression.
 *
 * Basically, the algorithm replaces any non alphanumeric character to `_`.
 *
 * @param {string} packageName a valid NPM package name
 *
 * @return {string} a valid JS variable name
 */
module.exports = function (packageName) {
	return '__' + packageName.replace(/[^A-Za-z0-9]/g, '_');
};
