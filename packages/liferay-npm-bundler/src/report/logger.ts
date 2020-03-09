/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import project from 'liferay-npm-build-tools-common/lib/project';
import {LogLevel} from 'liferay-npm-build-tools-common/lib/project/misc';

let debugOn: boolean, infoOn: boolean, errorOn: boolean, warnOn: boolean;

/* eslint-disable no-fallthrough */
switch (project.misc.reportLevel) {
	case 'debug':
		debugOn = true;
	case 'info':
		infoOn = true;
	case 'warn':
		warnOn = true;
	case 'error':
	default:
		errorOn = true;
	case 'off':
}
/* eslint-enable no-fallthrough */

export default class ReportLogger {
	get messages(): {
		logLevel: LogLevel;
		things: unknown[];
	}[] {
		return this._messages;
	}

	debug(...things: unknown[]): void {
		if (!debugOn) {
			return;
		}

		this._messages.push({
			logLevel: 'debug',
			things,
		});
	}

	info(...things: unknown[]): void {
		if (!infoOn) {
			return;
		}

		this._messages.push({
			logLevel: 'info',
			things,
		});
	}

	warn(...things: unknown[]): void {
		if (!warnOn) {
			return;
		}

		this._messages.push({
			logLevel: 'warn',
			things,
		});
	}

	error(...things: unknown[]): void {
		if (!errorOn) {
			return;
		}

		this._messages.push({
			logLevel: 'error',
			things,
		});
	}

	private readonly _messages: {
		logLevel: LogLevel;
		things: unknown[];
	}[] = [];
}
