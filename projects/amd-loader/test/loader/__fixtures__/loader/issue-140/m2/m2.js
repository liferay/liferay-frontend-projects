/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

Loader.define('issue-140/m2/m2', ['module', 'issue-140/m1'], function (
	module,
	m1
) {
	module.exports = function () {
		return m1();
	};
});
