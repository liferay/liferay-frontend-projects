/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {spawn} = require('cross-spawn');

/**
 * Convenience helper for running commands.
 */
function run(executable, ...args) {
	let options = {
		stdio: 'inherit',
	};

	if (args.length > 0 && typeof args[args.length - 1] === 'object') {
		options = {
			...options,
			...args.pop(),
		};
	}

	const command = `${executable} ${args.join(' ')}`;

	const {error, signal, status} = spawn.sync(executable, args, options);

	if (error) {
		throw error;
	}

	if (signal) {
		throw new Error(
			`run(): command \`${command}\` exited due to signal ${signal}`
		);
	}

	if (status) {
		throw new Error(
			`run(): command \`${command}\` exited with status ${status}`
		);
	}
}

module.exports = run;
