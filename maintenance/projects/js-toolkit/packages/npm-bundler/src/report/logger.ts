/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {B3LogLevel as LogLevel} from '@liferay/js-toolkit-core';

import {project} from '../globals';

const {reportLevel} = project.misc;

export default class ReportLogger {
	get messages(): {
		logLevel: LogLevel;
		things: unknown[];
	}[] {
		return this._messages;
	}

	debug(...things: unknown[]): void {
		if (reportLevel < LogLevel.debug) {
			return;
		}

		this._messages.push({
			logLevel: LogLevel.debug,
			things,
		});
	}

	info(...things: unknown[]): void {
		if (reportLevel < LogLevel.info) {
			return;
		}

		this._messages.push({
			logLevel: LogLevel.info,
			things,
		});
	}

	warn(...things: unknown[]): void {
		if (reportLevel < LogLevel.warn) {
			return;
		}

		this._messages.push({
			logLevel: LogLevel.warn,
			things,
		});
	}

	error(...things: unknown[]): void {
		if (reportLevel < LogLevel.error) {
			return;
		}

		this._messages.push({
			logLevel: LogLevel.error,
			things,
		});
	}

	private readonly _messages: {
		logLevel: LogLevel;
		things: unknown[];
	}[] = [];
}
