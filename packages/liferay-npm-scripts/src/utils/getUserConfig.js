/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const cosmiconfig = require('cosmiconfig');

const findRoot = require('./findRoot');

/**
 * Helper to get configuration via `cosmiconfig`
 * @param {string} moduleName Name of user config file
 * @param {object} whether to walk up looking for config if needed
 */
module.exports = function(moduleName, options = {}) {
	const stopDir = (options.upwards && findRoot()) || process.cwd();

	const explorer = cosmiconfig(moduleName, {stopDir});

	const result = explorer.searchSync();

	return result ? result.config : {};
};
