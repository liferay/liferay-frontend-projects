/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

const BLANK_LINES = /^\s*$/;
const COMMENTS = /^\s*#/;
const LINE_SEPARATORS = /[\n\r]+/;

/**
 * Loose implementation of an "ignore-file" reader based on `man 5 gitignore`.
 *
 * Differences include:
 *
 * - Both trailing and leading whitespace are ignored, allowing lines to be
 *   indented to form sections (in Git, only trailing whitespace is ignored).
 * - Backslash-escaping of special characeters (eg. "#") is not implemented.
 */
function readIgnoreFile(file) {
	return fs
		.readFileSync(file)
		.toString()
		.split(LINE_SEPARATORS)
		.filter(line => {
			return !COMMENTS.test(line) && !BLANK_LINES.test(line);
		})
		.map(line => line.trim());
}

module.exports = readIgnoreFile;
