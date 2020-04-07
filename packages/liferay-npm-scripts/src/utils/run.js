/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {spawn} = require('cross-spawn');

/**
 * Convenience helper for running commands.
 */
function run(executable, ...args) {
	const command = [executable, ...args].join(' ');

	const {error, signal, status, stderr, stdout} = spawn.sync(
		executable,
		args
	);

	if (error || signal || status) {
		if (process.env.CI && process.env.TRAVIS) {
			process.stderr.write('command:\n\n' + command + '\n\n');
			process.stderr.write('stdout:\n\n' + stdout + '\n\n');
			process.stderr.write('stderr:\n\n' + stderr + '\n\n');
		}
	}

	if (error) {
		throw error;
	}

	if (signal) {
		throw new Error(
			`run(): command \`${command}\` exited due to signal ${signal}.`
		);
	}

	if (status) {
		throw new Error(
			`run(): command \`${command}\` exited with status ${status}.`
		);
	}

	return stdout.toString().trim();
}

module.exports = run;
