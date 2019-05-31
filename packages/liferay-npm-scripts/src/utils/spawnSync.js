/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {spawn} = require('cross-spawn');
const fs = require('fs');
const path = require('path');

function getDescription(command, args) {
	return [command].concat(args).join(' ');
}

/**
 * Wrapper function for spawning a synchronous process.
 * @param {string} command Path to bin file
 * @param {Array=} args=[] List of string arguments
 * @param {Object=} options={} Options to pass to spawn.sync
 * @param {boolean} silent=false Should swallow non-error exit codes.
 */
module.exports = function(command, args = [], options = {}, silent = false) {
	const localCommand = path.join(
		__dirname,
		'../../node_modules/.bin',
		command
	);
	const executable = fs.existsSync(localCommand) ? localCommand : command;

	const {error, status} = spawn.sync(executable, args, {
		stdio: 'inherit',
		...options
	});

	if (status && !silent) {
		throw new Error(
			`Command ${getDescription(
				executable,
				args
			)} exited with code ${status}`
		);
	} else if (error) {
		throw new Error(
			`Command ${getDescription(
				executable,
				args
			)} failed with error ${error}`
		);
	}
};
