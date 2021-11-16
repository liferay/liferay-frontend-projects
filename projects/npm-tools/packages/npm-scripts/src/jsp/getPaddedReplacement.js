/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Valid character to end an identifier (has property "ID Continue")
 * which we can assume is very likely unused in liferay-portal.
 *
 * Unicode name is "MODIFIER LETTER LEFT HALF RING" and glyph is: "ʿ"
 *
 * @see: https://codepoints.net/U+02BF
 * @see https://mathiasbynens.be/notes/javascript-identifiers-es6
 */
const ID_END = '\u02bf';

/**
 * Valid character to start an identifier (has property "ID Start") which we can
 * assume is very likely unused in liferay-portal.
 *
 * Unicode name is "MODIFIER LETTER RIGHT HALF RING" and glyph is: "ʾ"
 *
 * @see https://codepoints.net/U+02BE
 * @see https://mathiasbynens.be/notes/javascript-identifiers-es6
 */
const ID_START = '\u02be';

/**
 * RegExp for matching an identifier that was created with
 * `getPaddedReplacement()`.
 */
const IDENTIFIER = new RegExp(`${ID_START}[^${ID_END}]+${ID_END}`);

/**
 * Returns a best-effort equal-length substitution for "match" based on
 * "template". Rare but still valid characters are used at the beginning and end
 * of the replacement to make it easy to find the replacements again in the
 * source.
 *
 * If `template` is longer than `match`, the full `template` is returned.
 */
function getPaddedReplacement(match, template) {
	const paddingLength = Math.max(match.length - template.length - 2, 0);

	const padding = '_'.repeat(paddingLength);

	return ID_START + template + padding + ID_END;
}

getPaddedReplacement.IDENTIFIER = IDENTIFIER;
getPaddedReplacement.ID_END = ID_END;
getPaddedReplacement.ID_START = ID_START;

module.exports = getPaddedReplacement;
