/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {B3LogLevel as LogLevel, format} from '@liferay/js-toolkit-core';

import {project} from '../globals';

const {logLevel} = project.misc;

export function error(...args: unknown[]): void {
	if (logLevel < LogLevel.error) {
		return;
	}

	format.print(format.error`${args.join(' ')}`);
}

export function warn(...args: unknown[]): void {
	if (logLevel < LogLevel.warn) {
		return;
	}

	format.print(format.warn`${args.join(' ')}`);
}

export function success(...args: unknown[]): void {
	if (logLevel < LogLevel.error) {
		return;
	}

	format.print(format.success`${args.join(' ')}`);
}

export function info(...args: unknown[]): void {
	if (logLevel < LogLevel.info) {
		return;
	}

	format.print(format.info`${args.join(' ')}`);
}

export function debug(...args: unknown[]): void {
	if (logLevel < LogLevel.debug) {
		return;
	}

	format.print(format.debug`${args.join(' ')}`);
}
