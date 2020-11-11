/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const expandGlobs = require('../utils/expandGlobs');
const filterChangedFiles = require('../utils/filterChangedFiles');
const filterGlobs = require('../utils/filterGlobs');
const findRoot = require('../utils/findRoot');
const log = require('../utils/log');
const preprocessGlob = require('../utils/preprocessGlob');
const readIgnoreFile = require('../utils/readIgnoreFile');

const DEFAULT_OPTIONS = {
	useDefaultIgnores: true,
};

/**
 * Given a set of `globs`, the file `extensions` we are interested
 * in, and the name of an `ignoreFile` (eg. '.prettierignore' or
 * '.eslintignore'), returns a list of matching files on the file
 * system.
 */
function getPaths(globs, extensions, ignoreFile, options = {}) {
	options = {
		...DEFAULT_OPTIONS,
		...options,
	};

	const root = findRoot();

	ignoreFile = ignoreFile ? path.join(root || '.', ignoreFile) : '';

	const ignores = fs.existsSync(ignoreFile) ? readIgnoreFile(ignoreFile) : [];

	// Match Prettier behavior and ignore node_modules by default.

	if (
		options.useDefaultIgnores &&
		ignores.indexOf('node_modules/**') === -1
	) {
		ignores.unshift('node_modules/**');
	}

	// Turn "{src,test}/*" into ["src/*", "test/*"]:

	globs = [].concat(...globs.map((glob) => preprocessGlob(glob)));

	// Filter out globs that don't apply to `extensions`.

	globs = filterGlobs(globs, ...extensions);

	if (!globs.length) {
		log(
			`No globs applicable to ${extensions.join(
				', '
			)} files specified: globs can be configured via npmscripts.config.js`
		);

		return [];
	}

	// Actually traverse the file system.

	let paths = expandGlobs(globs, ignores);

	// Potentially reduce file list to only files changed on the current branch.

	paths = filterChangedFiles(paths);

	return paths;
}

module.exports = getPaths;
