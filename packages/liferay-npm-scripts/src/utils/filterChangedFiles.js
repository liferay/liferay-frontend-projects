/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

/**
 * In the context of liferay-portal, we may want to run against a subset of
 * eligible files (eg. files changed on the current branch). To achieve this, we
 * check the LIFERAY_NPM_SCRIPTS_CHANGED_FILES environment variable for a list
 * of selections.
 *
 * If the variable is not set, the `files` list is return unchanged.
 */
function filterChangedFiles(files) {
	const changedFiles = process.env.LIFERAY_NPM_SCRIPTS_CHANGED_FILES;

	if (changedFiles === undefined) {
		return files;
	}

	const set = new Set();

	changedFiles.split(',').forEach(changedFile => {
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
