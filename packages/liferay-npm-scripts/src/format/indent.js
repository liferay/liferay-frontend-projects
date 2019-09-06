/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Indent every line (except for empty lines) by `count` units of `whitespace`..
 */
function indent(text, count = 2, whitespace = ' ') {
	return text
		.split('\n')
		.map(line => {
			if (line.length) {
				return `${whitespace.repeat(count)}${line}`;
			} else {
				return line;
			}
		})
		.join('\n');
}

module.exports = indent;
