/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const childProcess = require('child_process');

module.exports = function capture(command, options = {}) {
	return new Promise((resolve, reject) => {
		childProcess.exec(command, options, (error, stdout, _stderr) => {
			if (error) {
				reject(error);
			}
			else {
				resolve(stdout);
			}
		});
	});
};
