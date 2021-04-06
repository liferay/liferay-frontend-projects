/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

/**
 * Runs the `callback()` in the context of the "current" working directory,
 * which may not be the working directory at the time `liferay-npm-scripts` was
 * invoked.
 *
 * This seems to be an undocumented feature, but `yarn run liferay-npm-scripts`
 * will walk up the directory tree looking for a `package.json` file and change
 * to that directory before invoking us, but it will helpfully set the
 * `INIT_CWD` environment variable so that we can tell where we came from:
 *
 *      https://twitter.com/kentcdodds/status/922875214173757440
 *
 * This means that you can run a command like `yarn run format` in an OSGi
 * project that doesn't have a `package.json` (but may still have JS inside JSP
 * files) and have it execute scoped to that project. This is much quicker than
 * running `format` from the top, which would examine every eligible file in the
 * entire repo.
 */
async function inCurrentWorkingDirectory(callback) {
	const cwd = process.cwd();

	const INIT_CWD = process.env.INIT_CWD || cwd;

	let directory = INIT_CWD;

	if (INIT_CWD !== cwd) {

		// Walk up until we find the closest `package.json` or `build.gradle`.

		while (directory) {
			if (
				fs.existsSync(path.join(directory, 'package.json')) ||
				fs.existsSync(path.join(directory, 'build.gradle'))
			) {
				break;
			}

			if (path.dirname(directory) === directory) {

				// Can't go any higher.

				break;
			}

			directory = path.dirname(directory);
		}
	}

	try {
		process.chdir(directory);

		return await callback();
	}
	finally {
		process.chdir(cwd);
	}
}

module.exports = inCurrentWorkingDirectory;
