/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';

import FilePath from '../../file/FilePath';
import {print, warn} from '../../format';
import Project from './Project';

/** Valid log levels for console and report */
export enum LogLevel {
	off = 0,
	error = 1,
	warn = 2,
	info = 3,
	debug = 4,
}

/**
 * Reflects miscellaneous project configuration values.
 */
export default class Misc {

	/**
	 *
	 * @param project
	 */
	constructor(project: Project) {
		this._project = project;
	}

	/**
	 * Whether or not to dump detailed information about what the tool is doing
	 */
	get logLevel(): LogLevel {
		if (this._logLevel === undefined) {
			const {configuration} = this._project;

			let logLevel = prop.get<string>(
				configuration,
				'log-level',
				LogLevel[LogLevel.warn]
			);

			if (LogLevel[logLevel] === undefined) {
				print(
					warn`Configuration value {log-level} has invalid value: it will be ignored`
				);

				logLevel = LogLevel[LogLevel.warn];
			}

			this._logLevel = LogLevel[logLevel];
		}

		return this._logLevel;
	}

	/**
	 * Get maximum number of files to process in parallel in any parallelizable
	 * operation.
	 */

	get maxParallelFiles(): number {
		if (this._maxParallelFiles === undefined) {
			const {configuration} = this._project;

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

			let maxParallelFiles: string = prop.get<string>(
				configuration,
				'max-parallel-files',
				'128'
			);

			if (parseInt(maxParallelFiles, 10) === Number.NaN) {
				print(
					warn`Configuration value {max-parallel-files} has invalid value: it will be ignored`
				);

				maxParallelFiles = '128';
			}

			this._maxParallelFiles = parseInt(maxParallelFiles, 10);
		}

		return this._maxParallelFiles;
	}

	/**
	 * Get the path to the report file or undefined if no report is configured.
	 */
	get reportFile(): FilePath | undefined {
		if (this._reportFile === undefined) {
			const {_project} = this;
			const {configuration} = _project;

			const dumpReport = prop.get(configuration, 'dump-report', false);

			this._reportFile = dumpReport
				? _project.dir.join('liferay-npm-bundler-report.html')
				: undefined;
		}

		return this._reportFile;
	}

	/**
	 * Get report log level
	 */
	get reportLevel(): LogLevel {
		if (this._reportLevel === undefined) {
			const {_project} = this;
			const {configuration} = _project;

			let dumpReport = prop.get<string | boolean>(
				configuration,
				'dump-report',
				false
			);

			if (typeof dumpReport === 'boolean') {
				if (dumpReport) {
					dumpReport = LogLevel[LogLevel.info];
				}
				else {
					dumpReport = LogLevel[LogLevel.off];
				}
			}
			else if (LogLevel[dumpReport] === undefined) {
				print(
					warn`Configuration value {dump-report} has invalid value: it will be ignored`
				);
				dumpReport = LogLevel[LogLevel.off];
			}

			this._reportLevel = LogLevel[dumpReport];
		}

		return this._reportLevel;
	}

	private readonly _project: Project;
	private _logLevel: LogLevel;
	private _maxParallelFiles: number;
	private _reportFile: FilePath;
	private _reportLevel: LogLevel;
}
