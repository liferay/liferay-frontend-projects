/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */
const CWD = process.cwd();

const {spawn} = require('cross-spawn');

/**
 * Wrapper function for spawning a synchronous process.
 * @param {string} command Path to bin file
 * @param {Array=} args=[] List of string arguments
 * @param {Object=} options={} Options to pass to spawn.sync
 */
module.exports = function(command, args = [], options = {}) {
	spawn.sync(command, args, {
		cwd: CWD,
		stdio: 'inherit',
		...options
	});
};
