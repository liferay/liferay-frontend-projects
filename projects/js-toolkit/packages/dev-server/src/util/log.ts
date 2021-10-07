/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

 import chalk from 'chalk';

import type {IncomingMessage} from 'http';

export function log(...messages: string[]): void {
	// eslint-disable-next-line no-console
	messages.forEach((message) => console.log(message));
}

function requestLog(request: IncomingMessage): (...messages: string[]) => void {
	const prefix = chalk.gray(`${request.method} ${request.url}`);

	return (...messages: string[]): void =>
		log(...messages.map((message) => `${prefix}\n${message}`));
}

export function getRequestLogger(request: IncomingMessage): (...messages: string[]) => void {
	return requestLog(request);
}
