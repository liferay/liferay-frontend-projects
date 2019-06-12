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
	fix: false,
	quiet: false
};

/**
 * File extensions that ESLint can process.
 */
const EXTENSIONS = ['.js', '.ts', '.tsx'];

/**
 * ESLint wrapper.
 */
function lint(options = {}) {
	const {fix, quiet} = {
		...DEFAULT_OPTIONS,
		...options
	};

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
