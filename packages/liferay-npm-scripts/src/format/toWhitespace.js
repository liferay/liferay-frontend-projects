/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Returns a copy of `string` with the same "shape", but containing only
 * whitespace.
 *
 * Used so that we can substitute source code with a same-shaped comment without
 * changing the relative position of anything else in the file.
 */
function toWhitespace(string) {
	return string
		.split(/\r?\n/)
		.map(segment => segment.replace(/\S/g, ' '))
		.join('\n');
}

module.exports = toWhitespace;
