/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const levelPriority = {
	/* eslint-disable sort-keys */

	off: 0, // shows nothing
	error: 1, // shows user errors
	warn: 2, // shows warnings about loader's internal state
	info: 3, // shows info messages about loader's internal state
	debug: 4, // shows debug messages about loader's internal state

	/* eslint-enable sort-keys */
};
const prefix = 'liferay-amd-loader |';

/* eslint-disable no-console */

export default class Logger {
	constructor(config) {
		this._config = config;
	}

	error(...args) {
		if (!this._applies('error')) {
			return;
		}

		console.error(prefix, ...args);
	}

	warn(...args) {
		if (!this._applies('warn')) {
			return;
		}

		console.warn(prefix, ...args);
	}

	info(...args) {
		if (!this._applies('info')) {
			return;
		}

		console.info(prefix, ...args);
	}

	debug(...args) {
		if (!this._applies('debug')) {
			return;
		}

		console.debug(prefix, ...args);
	}

	resolution(...args) {
		if (!this._config.explainResolutions) {
			return;
		}

		console.log(prefix, ...args);
	}

	_applies(logLevel) {
		const configPriority = levelPriority[this._config.logLevel];
		const logPriority = levelPriority[logLevel];

		return logPriority <= configPriority;
	}
}
