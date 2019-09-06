/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Filler character that uses a very-likely-to-be-unique Unicode code
 * point so that the when we generate placeholder comments they don't get
 * confused with real comments in the source.
 *
 * Unicode name is "BOX DRAWINGS LIGHT DIAGONAL CROSS" and glyph is: "╳"
 */
const FILLER = '\u2573';

/**
 * Returns a copy of `string` with the same "shape", but containing only
 * `filler`.
 *
 * Used so that we can substitute source code with a same-shaped comment without
 * changing the relative position of anything else in the file.
 *
 */
function toFiller(string, filler = FILLER) {
	let output = '';
	let lastIndex = 0;

	const NEW_LINES = /\r?\n/g;
	const NON_TAB = /[^\t]/g;

	// TODO: once we're on Node v12, switch this to `String.prototype.matchAll`.
	while (true) {
		const match = NEW_LINES.exec(string);

		if (match) {
			output +=
				string.slice(lastIndex, match.index).replace(NON_TAB, filler) +
				match[0];

			lastIndex = match.index + match[0].length;
		} else {
			output += string.slice(lastIndex).replace(NON_TAB, filler);
			break;
		}
	}

	return output;
}

toFiller.FILLER = FILLER;

module.exports = toFiller;
