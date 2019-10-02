/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import fs from 'fs';
import path from 'path';

import {Project} from '.';
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
	 * Whether or not to track usage
	 */
	get noTracking(): boolean {
		const {_project} = this;
		const {npmbundlerrc} = _project;

		if (!prop.has(npmbundlerrc, 'no-tracking')) {
			if (prop.has(process, 'env.LIFERAY_NPM_BUNDLER_NO_TRACKING')) {
				prop.set(npmbundlerrc, 'no-tracking', true);
			}
		}

		if (!prop.has(npmbundlerrc, 'no-tracking')) {
			let dir = _project.dir.asNative;

			while (
				!fs.existsSync(
					path.join(dir, '.liferay-npm-bundler-no-tracking')
				) &&
				path.resolve(dir, '..') !== dir
			) {
				dir = path.resolve(dir, '..');
			}

			if (
				fs.existsSync(
					path.join(dir, '.liferay-npm-bundler-no-tracking')
				)
			) {
				prop.set(npmbundlerrc, 'no-tracking', true);
			}
		}

		// Disable tracking by default
		return prop.get(npmbundlerrc, 'no-tracking', true);
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
	 * Whether or not to dump detailed information about what the tool is doing
	 */
	get verbose(): boolean {
		const {npmbundlerrc} = this._project;

		return prop.get(npmbundlerrc, 'verbose', false);
	}

	private readonly _project: Project;
}
