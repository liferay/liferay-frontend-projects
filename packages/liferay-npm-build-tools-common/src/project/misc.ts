/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {Project} from '.';
import prop from 'dot-prop';

import FilePath from '../file-path';

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
	get logLevel(): 'off' | 'error' | 'warn' | 'info' | 'debug' {
		const {npmbundlerrc} = this._project;

		return prop.get(npmbundlerrc, 'log-level', 'warn');
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

	private readonly _project: Project;
}
