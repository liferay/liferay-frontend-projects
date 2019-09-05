/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const PADDING = '_'.repeat(100);

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
 * Returns a best-effort equal-length substitution for "match" based on
 * "template". Rare but still valid characters are used at the beginning and end
 * of the replacement to make it easy to find the replacements again in the
 * source.
 *
 * If `template` is longer than `match`, the full `template` is returned.
 */
function getPaddedReplacement(match, template) {
	if (template.length + 2 > match.length) {
		// Truncating may produce an invalid identifier, so we don't risk it.
		return ID_START + template + ID_END;
	}

	return ID_START + (template + PADDING).slice(0, match.length - 2) + ID_END;
}

getPaddedReplacement.ID_END = ID_END;
getPaddedReplacement.ID_START = ID_START;

module.exports = getPaddedReplacement;
