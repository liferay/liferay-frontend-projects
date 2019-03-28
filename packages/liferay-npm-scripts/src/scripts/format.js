/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const lintScript = require('./lint');

/**
 * Main function for formatting files
 */
module.exports = function() {
	lintScript(true);
};
