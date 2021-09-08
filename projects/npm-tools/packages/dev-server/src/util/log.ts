/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

import chalk from 'chalk';

export function log(...messages: string[]) {
	// eslint-disable-next-line no-console
	messages.forEach((message) => console.log(message));
}

function requestLog(request: any) {
	const prefix = chalk.gray(`${request.method} ${request.url}`);

	return (...messages: string[]) =>
		log(...messages.map((message) => `${prefix}\n${message}`));
}

export function getRequestLogger(request: any) {
	return requestLog(request);
}
