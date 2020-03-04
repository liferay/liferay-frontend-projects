/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Project} from '.';
import prop from 'dot-prop';

import FilePath from '../file-path';
import {print, warn} from '../format';

/** Valid log levels for console and report */
export type LogLevel = 'off' | 'error' | 'warn' | 'info' | 'debug';

/**
 * Reflects miscellaneous project configuration values.
 */
export default class Misc {
	/**
	 *
	 * @param {Project} project
	 */
	constructor(project) {
		this._project = project;
	}

	/**
	 * Whether or not to dump detailed information about what the tool is doing
	 */
	get logLevel(): LogLevel {
		const {npmbundlerrc} = this._project;

		let logLevel = prop.get<string>(npmbundlerrc, 'log-level', 'warn');

		switch (logLevel) {
			case 'off':
			case 'error':
			case 'warn':
			case 'info':
			case 'debug':
				break;

			default:
				logLevel = 'off';
				print(
					warn`Configuration value {log-level} has invalid value: it will be ignored`
				);
				break;
		}

		return logLevel as LogLevel;
	}

	/**
	 * Get maximum number of files to process in parallel in any parallelizable
	 * operation.
	 */

	get maxParallelFiles(): number {
		const {npmbundlerrc} = this._project;

		// Default values for "ulimit -n" vary across different OSes. Some
		//
		// values I have found are:
		//   - Apparently Mac OS X limit is 256 but usually people increase it
		//   - Fedora: 1024
		//   - Windows: there's no ulimit, but MSVCRT.DLL has a 2048 limit
		//
		// Given this mess and the impossibility of retrieving the limit from
		// Node, I'm giving this a default value of 128 because it looks like it
		// doesn't impact performance and should be low enough to make it work
		// in all OSes.
		return prop.get(npmbundlerrc, 'max-parallel-files', 128);
	}

	/**
	 * Get the path to the report file or undefined if no report is configured.
	 */
	get reportFile(): FilePath | undefined {
		const {_project} = this;
		const {npmbundlerrc} = _project;

		const dumpReport = prop.get(npmbundlerrc, 'dump-report', false);

		return dumpReport
			? _project.dir.join('liferay-npm-bundler-report.html')
			: undefined;
	}

	/**
	 * Get report log level
	 */
	get reportLevel(): LogLevel {
		const {_project} = this;
		const {npmbundlerrc} = _project;

		let dumpReport = prop.get<string | boolean>(
			npmbundlerrc,
			'dump-report',
			false
		);

		switch (dumpReport) {
			case 'off':
			case 'error':
			case 'warn':
			case 'info':
			case 'debug':
				break;

			case true:
				dumpReport = 'info';
				break;

			case false:
				dumpReport = 'off';
				break;

			default:
				dumpReport = 'off';
				print(
					warn`Configuration value {dump-report} has invalid value: it will be ignored`
				);
				break;
		}

		return dumpReport as LogLevel;
	}

	private readonly _project: Project;
}
