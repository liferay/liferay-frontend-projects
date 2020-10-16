/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const child_process = require('child_process');

const {log} = require('./console');

/**
 * Convenience wrapper for running a Git command and returning its
 * output (via a Promise).
 */
function git(...args) {
	return run('git', ...args);
}

/**
 * Run `command` and return its stdout (via a Promise).
 */
function run(command, ...args) {
	return new Promise((resolve, reject) => {
		child_process.execFile(command, args, (error, stdout, stderr) => {
			if (error) {
				const invocation = `${command} ${args.join(' ')}`;

				log(
					`command: ${invocation}`,
					`stdout: ${stdout}`,
					`stderr: ${stderr}`
				);

				reject(new Error(`Command: "${invocation}" failed: ${error}`));
			}
			else {
				resolve(stdout);
			}
		});
	});
}

module.exports = git;
