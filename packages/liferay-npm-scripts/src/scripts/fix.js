/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const check = require('./check');

/**
 * Main function for fixing (formatting and applying lint fixes to) files.
 */
module.exports = function() {
	check(true);
};
