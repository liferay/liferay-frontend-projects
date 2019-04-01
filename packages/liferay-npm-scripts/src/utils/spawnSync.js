/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const CWD = process.cwd();
const PATH = path.resolve(`${__dirname}/../../node_modules/.bin`);

const {spawn} = require('cross-spawn');

function getDescription(command, args) {
	return [command].concat(args).join(' ');
}

/**
 * Wrapper function for spawning a synchronous process.
 * @param {string} command Path to bin file
 * @param {Array=} args=[] List of string arguments
 * @param {Object=} options={} Options to pass to spawn.sync
 */
module.exports = function(command, args = [], options = {}) {
	const {error, status} = spawn.sync(command, args, {
		cwd: CWD,
		env: {
			...process.env,
			PATH: `${PATH}:${process.env.PATH}`
		},
		stdio: 'inherit',
		...options
	});

	if (status) {
		throw new Error(
			`Command ${getDescription(
				command,
				args
			)} exited with code ${status}`
		);
	} else if (error) {
		throw new Error(
			`Command ${getDescription(
				command,
				args
			)} failed with error ${error}`
		);
	}
};
