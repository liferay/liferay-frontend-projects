/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const getMergedConfig = require('../utils/get-merged-config');
const spawnSync = require('../utils/spawnSync');

const LINT_PATHS = getMergedConfig('npmscripts').lint;

/**
 * Main function for linting and formatting files
 * @param {boolean} fix Specify if the linter should auto-fix the files
 */
module.exports = function(fix) {
	const CONFIG_PATH = path.join(process.cwd(), 'TEMP-prettier-config.json');

	fs.writeFileSync(CONFIG_PATH, JSON.stringify(getMergedConfig('prettier')));

	try {
		const args = [
			'--config',
			CONFIG_PATH,
			fix ? '--write' : '--check',
			...LINT_PATHS
		];

		spawnSync('prettier', args, {});
	} finally {
		fs.unlinkSync(CONFIG_PATH);
	}
};
