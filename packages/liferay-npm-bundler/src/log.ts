/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as format from 'liferay-npm-build-tools-common/lib/format';
import project from 'liferay-npm-build-tools-common/lib/project';

let debugOn: boolean, infoOn: boolean, errorOn: boolean, warnOn: boolean;

/* eslint-disable no-fallthrough */
switch (project.misc.logLevel) {
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

export function error(...args: unknown[]): void {
	if (!errorOn) {
		return;
	}

	format.print(format.error`${args.join(' ')}`);
}

export function warn(...args: unknown[]): void {
	if (!warnOn) {
		return;
	}

	format.print(format.warn`${args.join(' ')}`);
}

export function success(...args: unknown[]): void {
	if (!errorOn) {
		return;
	}

	format.print(format.success`${args.join(' ')}`);
}

export function info(...args: unknown[]): void {
	if (!infoOn) {
		return;
	}

	format.print(format.info`${args.join(' ')}`);
}

export function debug(...args: unknown[]): void {
	if (!debugOn) {
		return;
	}

	format.print(format.debug`${args.join(' ')}`);
}
