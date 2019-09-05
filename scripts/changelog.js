#!/usr/bin/env node

/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const RED = '\x1b[31m';
const RESET = '\x1b[0m';

/**
 * Log a line to stderr.
 */
function log(...args) {
	process.stderr.write(`${args.join('\n')}\n`);
}

/**
 * Log a line to stderr, using error formatting.
 */
function error(...args) {
	log(`${RED}error: ${args.join('\n')}${RESET}`);
}

error(
	'changelog.js is now liferay-changelog-generator',
	'',
	'To use it, try:',
	'',
	`    npx liferay-changelog-generator ${process.argv.slice(2).join(' ')}`,
	''
);

process.exit(1);
