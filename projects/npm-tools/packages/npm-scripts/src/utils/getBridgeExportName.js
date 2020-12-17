/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

module.exports = function (packageName) {
	return '__' + packageName.replace(/[^A-Za-z0-9]/g, '_');
};
