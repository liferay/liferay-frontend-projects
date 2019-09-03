/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Prefixes `string` with lines containing the `padding` string such that the
 * contents of string start at `startLine`.
 *
 * This so that problems found with ESLint use line numbers corresponding to
 * the original source file from which `string` was extracted.
 */
function padLines(string, startLine, padding = '') {
	return `${padding}\n`.repeat(startLine) + string;
}

module.exports = padLines;
