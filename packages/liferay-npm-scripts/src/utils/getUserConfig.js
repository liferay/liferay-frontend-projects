/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const CWD = process.cwd();
const cosmiconfig = require('cosmiconfig');

/**
 * Helper to get configuration via `cosmiconfig`
 * @param {string} moduleName Name of user config file
 */
module.exports = function(moduleName) {
	const explorer = cosmiconfig(moduleName, {stopDir: CWD});

	const result = explorer.searchSync();

	return result ? result.config : {};
};
