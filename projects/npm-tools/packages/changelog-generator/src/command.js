/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {exec} = require('child_process');

const {error} = require('./console');

function runCommand(command) {
	exec(command, (err, stdout, stderr) => {
		if (err) {
			error(`error: ${err.message}`);

			return;
		}
		if (stderr) {
			error(`stderr: ${stderr}`);
		}
	});
}

module.exports = runCommand;
