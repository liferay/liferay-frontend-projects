/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import project from 'liferay-npm-build-tools-common/lib/project';

/**
 * Log errors
 * @return {void}
 */
export function error(...args) {
	console.log(...args);
}

/**
 * Log message as console.log does
 * @return {void}
 */
export function info(...args) {
	console.log(...args);
}

/**
 * Log message as console.log does but only if verbose is on
 * @return {void}
 */
export function debug(...args) {
	if (project.misc.verbose) {
		console.log(...args);
	}
}
