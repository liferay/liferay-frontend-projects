/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as fmt from 'liferay-npm-build-tools-common/lib/format';
import project from 'liferay-npm-build-tools-common/lib/project';

let debugOn, infoOn, errorOn;

switch (project.misc.logLevel) {
	case 'debug':
		debugOn = true;
	case 'info':
		infoOn = true;
	case 'error':
		errorOn = true;
	case 'off':
}

export function error(...args: any[]): void {
	if (!errorOn) {
		return;
	}

	fmt.print(fmt.error`${args.join(' ')}`);
}

export function success(...args: any[]): void {
	if (!errorOn) {
		return;
	}

	fmt.print(fmt.success`${args.join(' ')}`);
}

export function info(...args: any[]): void {
	if (!infoOn) {
		return;
	}

	fmt.print(fmt.info`${args.join(' ')}`);
}

export function debug(...args: any[]): void {
	if (!debugOn) {
		return;
	}

	fmt.print(fmt.debug`${args.join(' ')}`);
}
