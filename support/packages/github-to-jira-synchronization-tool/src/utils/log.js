/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const fs = require('fs');

let logFile;

module.exports = function log(message) {
	if (!logFile) {
		logFile = fs.createWriteStream(process.cwd() + '/debug.log', {
			flags: 'a',
		});
	}

	logFile.write(`${message}\n`);
};
