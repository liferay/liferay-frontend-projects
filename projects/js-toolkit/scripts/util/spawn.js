/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const childProcess = require('child_process');

module.exports = function spawn(cmd, args = [], options = {}) {
	const result = childProcess.spawnSync(cmd, args, {
		shell: true,
		stdio: 'inherit',
		...options,
	});

	if (result.error) {
		throw result.error;
	}

	if (result.status !== 0) {
		throw new Error(`Execution failure: ${cmd} ${args.join(' ')}`);
	}
};
