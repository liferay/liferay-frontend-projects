/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import project from 'liferay-npm-build-tools-common/lib/project';

/**
 * Log errors
 */
export function error(...args: any[]): void {
	console.error(...args);
}

/**
 * Log message as console.log does
 */
export function info(...args: any[]): void {
	console.log(...args);
}

/**
 * Log message as console.log does but only if verbose is on
 */
export function debug(...args: any[]): void {
	if (project.misc.verbose) {
		console.log(...args);
	}
}
