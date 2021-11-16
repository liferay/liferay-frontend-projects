/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {spawn} = require('cross-spawn');
const fs = require('fs');
const path = require('path');

/**
 * Represents an error inside the spawned process.
 *
 * Used to indicate that we succeeded in spawning the process, but it exited
 * with a non-zero exit code.
 */
class SpawnError extends Error {}

function getDescription(command, args) {
	return [command].concat(args).join(' ');
}

/**
 * Wrapper function for spawning a synchronous process.
 * @param {string} command Path to bin file
 * @param {Array=} args=[] List of string arguments
 * @param {Object=} options={} Options to pass to spawn.sync
 */
function spawnSync(command, args = [], options = {}) {
	const localCommand = path.join(
		__dirname,
		'../../node_modules/.bin',
		command
	);

	const executable = fs.existsSync(localCommand) ? localCommand : command;

	const {error, signal, status} = spawn.sync(executable, args, {
		stdio: 'inherit',
		...options,
	});

	if (status) {
		throw new SpawnError(
			`Command ${getDescription(
				executable,
				args
			)} exited with code ${status}`
		);
	}
	else if (error) {

		// We didn't successfully spawn, so this is a hard error.

		throw new Error(
			`Command ${getDescription(
				executable,
				args
			)} failed with error ${error}`
		);
	}
	else if (signal) {
		throw new Error(
			`Command ${getDescription(
				executable,
				args
			)} killed by signal ${signal}`
		);
	}
}

spawnSync.SpawnError = SpawnError;

module.exports = spawnSync;
