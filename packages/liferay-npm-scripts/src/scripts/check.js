/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');
const filterGlobs = require('../utils/filterGlobs');
const getMergedConfig = require('../utils/getMergedConfig');
const log = require('../utils/log');
const spawnSync = require('../utils/spawnSync');

/**
 * File extensions that we want Prettier to process.
 */
const EXTENSIONS = ['.js', '.scss'];

/**
 * Main function for linting and formatting files
 * @param {boolean} fix Specify whether to auto-fix the files
 */
module.exports = function(fix) {
	const config = fix
		? getMergedConfig('npmscripts', 'fix')
		: getMergedConfig('npmscripts', 'check');

	const globs = filterGlobs(config, ...EXTENSIONS);

	if (!globs.length) {
		const extensions = EXTENSIONS.join(', ');

		log(
			`No globs applicable to ${extensions} files specified: globs can be configured via npmscripts.config.js`
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
