/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const spawnSync = require('../utils/spawnSync');

/**
 * Main function for running webpack within the liferay-portal repo.
 */
module.exports = function() {
	spawnSync('webpack');
};
