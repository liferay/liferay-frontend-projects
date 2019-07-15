/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
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
 */
function filterChangedFiles(files) {
	const upstream = process.env.LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME;

	if (upstream === undefined) {
		return files;
	}

	const topLevel = git('rev-parse', '--show-toplevel');

	const mergeBase = git('merge-base', 'HEAD', upstream);

	const changedFiles = git(
		'diff',
		'-z',
		'--diff-filter=ACMR',
		'--name-only',
		mergeBase,
		'HEAD'
	)
		.split(/\0/)
		.map(file => {
			return file ? path.join(topLevel, file) : file;
		})
		.filter(Boolean);

	const set = new Set();

	changedFiles.forEach(changedFile => {
		if (path.isAbsolute(changedFile)) {
			set.add(changedFile);
		} else {
			const absolute = path.normalize(path.resolve(changedFile));

			set.add(absolute);
		}
	});

	return files.filter(file => {
		const absolute = path.normalize(path.resolve(file));

		return set.has(absolute);
	});
}

module.exports = filterChangedFiles;
