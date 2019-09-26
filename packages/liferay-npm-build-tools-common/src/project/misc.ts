/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';

import {Project} from '.';

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
		const {_npmbundlerrc} = this._project;

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
		return prop.get(_npmbundlerrc, 'max-parallel-files', 128);
	}

	_project: Project;
}
