/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Given a list of glob patterns, returns those that apply to files with the
 * specified extension(s).
 */
function filterGlobs(globs, ...extensions) {
	extensions.forEach(extension => {
		if (!extension.match(/^\.\w+$/)) {
			throw new Error(
				`filterGlobs(): expected extension ${JSON.stringify(
					extension
				)} to be of the form ".ext"`
			);
		}
	});

	return globs.filter(glob => {
		return extensions.some(extension => glob.endsWith(extension));
	});
}

module.exports = filterGlobs;
