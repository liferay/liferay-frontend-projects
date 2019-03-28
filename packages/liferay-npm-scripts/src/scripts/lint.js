/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getMergedConfig = require('../utils/get-merged-config');
const spawnSync = require('../utils/spawnSync');

const LINT_PATHS = getMergedConfig('npmscripts').lint;

/**
 * Main function for linting and formatting files
 * @param {boolean} fix Specify if the linter should auto-fix the files
 */
module.exports = function(fix) {
	const args = [...LINT_PATHS];

	if (fix) {
		args.push('-i');
	}

	spawnSync('csf', args);
};
