/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const run = require('./run');

/**
 * Convenience helper for running Git commands.
 */
function git(...args) {
	return run('git', ...args);
}

module.exports = git;
