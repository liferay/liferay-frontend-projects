/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const chalk = require('chalk');

function log(...messages) {
	// eslint-disable-next-line no-console
	messages.forEach((message) => console.log(message));
}

function requestLog(request) {
	const prefix = chalk.gray(`${request.method} ${request.url}`);

	return (...messages) =>
		log(...messages.map((message) => `${prefix}\n${message}`));
}

module.exports = {
	getRequestLogger: (request) => requestLog(request),
	log,
};
