/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const git = require('./git');

/**
 * In the context of liferay-portal, we may want to run against a subset of
 * eligible files (eg. files changed on the current branch). To achieve this, we
 * check the LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME environment variable and if
 * it is set, filter the `files` list to contain only files changed with respect
 * to that branch (usually "master", but may also be "master-private").
 *
 * If the variable is not set, the `files` list is return unchanged.
 *
 * One important exception to the above: if the top-level `package.json`
 * changes (which happens rarely), this may indicate a change of the
 * @liferay/npm-scripts version, and in that case we want to run against
 * the entire unfiltered `files` list.
 *
 * @param {Array<string>} files List of files relative to the current directory.
 */
function filterChangedFiles(files) {
	const upstream = process.env.LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME;

	if (upstream === undefined) {
		return files;
	}

	const topLevel = git('rev-parse', '--show-toplevel');

	const prefix = git('rev-parse', '--show-prefix').trim() || '.';

	const mergeBase = git('merge-base', 'HEAD', upstream);

	// Check for changes in @liferay/npm-scripts version.

	try {
		git(
			'diff',
			mergeBase,
			'-G@liferay/npm-scripts',
			'--quiet',
			'--',
			path.join(topLevel, 'modules', 'package.json'),
			path.join(topLevel, 'modules', 'private', 'package.json')
		);
	}
	catch (error) {

		// An exit status of 1 means we detected the change we were looking for:
		//
		// https://git-scm.com/docs/git-diff#Documentation/git-diff.txt---quiet
		// https://git-scm.com/docs/git-diff#Documentation/git-diff.txt---exit-code

		if (error.toString().includes('exited with status 1.')) {
			return files;
		}
	}

	const changedFiles = git(
		'diff',
		'-z',
		'--diff-filter=ACMR',
		'--name-only',
		mergeBase,
		'HEAD'
	)
		.split(/\0/)
		.map((file) => {
			return file ? path.join(topLevel, file) : file;
		})
		.filter(Boolean);

	const set = new Set(changedFiles);

	return files.filter((file) => {
		const absolute = path.normalize(path.join(topLevel, prefix, file));

		return set.has(absolute);
	});
}

module.exports = filterChangedFiles;
