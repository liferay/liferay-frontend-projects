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
	let output = '';
	let lastIndex = 0;

	const NEW_LINES = /\r?\n/g;
	const NON_WS = /\S/g;

	// TODO: once we're on Node v12, switch this to `String.prototype.matchAll`.
	while (true) {
		const match = NEW_LINES.exec(string);

		if (match) {
			output +=
				string.slice(lastIndex, match.index).replace(NON_WS, ' ') +
				match[0];

			lastIndex = match.index + match[0].length;
		} else {
			output += string.slice(lastIndex).replace(NON_WS, ' ');
			break;
		}
	}

	return output;
}

module.exports = toWhitespace;
