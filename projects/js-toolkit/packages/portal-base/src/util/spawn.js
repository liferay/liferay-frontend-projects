/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const childProcess = require('child_process');

const abort = require('./abort');

module.exports = function spawn(bin, args) {
	const {error, signal, status} = childProcess.spawnSync(bin, args, {
		stdio: 'inherit',
	});

	if (error) {
		abort(error);
	}

	if (signal) {
		abort(`{${bin}} received signal: ${signal}`);
	}

	if (status !== 0) {
		abort(`{${bin}} exited with status: ${status}`);
	}
};
