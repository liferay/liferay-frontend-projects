/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const getMergedConfig = require('../utils/getMergedConfig');
const log = require('../utils/log');
const spawnSync = require('../utils/spawnSync');

const DEFAULT_OPTIONS = {
	fix: false,
	quiet: false
};

/**
 * ESLint wrapper.
 */
function lint(options = {}) {
	const {fix, quiet} = {
		...DEFAULT_OPTIONS,
		...options
	};

	const CONFIG = getMergedConfig('npmscripts');

	const globs = fix ? CONFIG.fix : CONFIG.check;

	if (!globs.length) {
		log(
			'No paths specified: paths can be configured via npmscripts.config.js'
		);

		return;
	}

	const CONFIG_PATH = path.join(process.cwd(), 'TEMP-eslint-config.json');

	fs.writeFileSync(CONFIG_PATH, JSON.stringify(getMergedConfig('eslint')));

	try {
		const args = [
			'--no-eslintrc',
			'--config',
			CONFIG_PATH,
			fix ? '--fix' : null,
			quiet ? '--quiet' : null,
			...globs
		].filter(Boolean);

		spawnSync('eslint', args);
	} finally {
		fs.unlinkSync(CONFIG_PATH);
	}
}

module.exports = lint;
