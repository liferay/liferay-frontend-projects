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

const DEFAULT_OPTIONS = {
	check: false
};

/**
 * File extensions that we want Prettier to process.
 */
const EXTENSIONS = ['.js', '.scss'];

/**
 * Prettier wrapper.
 */
function format(options = {}) {
	const {check} = {
		...DEFAULT_OPTIONS,
		...options
	};

	const config = check
		? getMergedConfig('npmscripts', 'check')
		: getMergedConfig('npmscripts', 'fix');

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
			check ? '--check' : '--write',
			...globs
		];

		spawnSync('prettier', args);
	} finally {
		fs.unlinkSync(CONFIG_PATH);
	}
}

module.exports = format;
