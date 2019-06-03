/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const getMergedConfig = require('../utils/get-merged-config');
const log = require('../utils/log');
const spawnSync = require('../utils/spawn-sync');

/**
 * Main function for linting and formatting files
 * @param {boolean} fix Specify if the linter should auto-fix the files
 */
module.exports = function(fix) {
	const CONFIG = getMergedConfig('npmscripts');

	const globs = fix ? CONFIG.format : CONFIG.lint;

	if (!globs.length) {
		log(
			'No paths specified: paths can be configured via npmscripts.config.js'
		);

		return;
	}

	const CONFIG_PATH = path.join(process.cwd(), 'TEMP-prettier-config.json');

	fs.writeFileSync(CONFIG_PATH, JSON.stringify(getMergedConfig('prettier')));

	try {
		const args = [
			'--config',
			CONFIG_PATH,
			fix ? '--write' : '--check',
			...globs
		];

		spawnSync('prettier', args);
	} finally {
		fs.unlinkSync(CONFIG_PATH);
	}
};
