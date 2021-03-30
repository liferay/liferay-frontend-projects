/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const color = require('../utils/color');
const findRoot = require('../utils/findRoot');
const git = require('../utils/git');
const log = require('../utils/log');
const spawnSync = require('../utils/spawnSync');

/**
 * Runs the TypeScript compiler, `tsc`, in the current working directory.
 *
 * Currently in liferay-portal we use either webpack or Babel to do
 * code-generation; `tsc` is only doing type-checking and emitting type
 * definitions.
 *
 * Returns `true` on success, `false` if type-checking completed
 * successfully but the definitions were stale. In all other cases
 * throws an error.
 */
function runTSC() {
	spawnSync('tsc', ['--emitDeclarationOnly']);

	// Check for stale (uncommitted) type artifacts.

	const output = git('status', '--porcelain', '--', 'types');

	if (output.length) {
		const root = findRoot() || '';

		const location = path.relative(root, path.join(process.cwd(), 'types'));

		log(
			`${color.YELLOW}${color.BOLD}`,
			'***************',
			'*** WARNING ***',
			'***************',
			'',
			'Out-of-date TypeScript build artifacts at:',
			'',
			`    ${location}`,
			'',
			'Please commit them.',
			'',
			output,
			color.RESET
		);

		return false;
	}

	return true;
}

module.exports = runTSC;
