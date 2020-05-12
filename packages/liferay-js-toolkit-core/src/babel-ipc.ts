/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable @typescript-eslint/camelcase */

import path from 'path';

import FilePath from './file/FilePath';

// Put the `_babel_ipc_` map in the global context
declare const global: {
	_babel_ipc_: object;
};
global._babel_ipc_ = global._babel_ipc_ || {};

/** Babel state object view */
interface BabelState {
	file: {
		opts: {
			filename: string;
		};
	};
}

/** A function that returns the default value for a key */
interface DefaultValueFactory {
	(): unknown;
}

/**
 * Get an IPC value for a given Babel plugin
 * @param state babel plugin state argument
 * @param defaultValue the default value or a factory to get it if value is not set
 * @return the IPC value
 */
export function get(
	state: BabelState,
	defaultValue: unknown | DefaultValueFactory
): unknown {
	let defaultValueFactory: DefaultValueFactory;

	if (typeof defaultValue !== 'function') {
		defaultValueFactory = (() => defaultValue) as DefaultValueFactory;
	} else {
		defaultValueFactory = defaultValue as DefaultValueFactory;
	}

	if (
		!state ||
		!state.file ||
		!state.file.opts ||
		!state.file.opts.filename
	) {
		return defaultValueFactory();
	}

	const key = new FilePath(state.file.opts.filename, {posix: true}).asNative;

	if (global._babel_ipc_[key] === undefined) {
		return defaultValueFactory();
	}

	return global._babel_ipc_[key];
}

/**
 * Set an IPC value for a given file path.
 * @param filePath the path of the file being processed
 * @param value the IPC value to set
 */
export function set(filePath: string, value: unknown): void {
	global._babel_ipc_[path.resolve(filePath)] = value;
}

/**
 * Clear an IPC value for a given file path.
 * @param filePath the path of the file being processed
 */
export function clear(filePath: string): void {
	delete global._babel_ipc_[path.resolve(filePath)];
}
