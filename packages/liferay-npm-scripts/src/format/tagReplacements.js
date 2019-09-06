/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const toFiller = require('./toFiller');

/**
 * Valid identifier character (has property "ID Start") which we can assume is
 * very likely unused in liferay-portal.
 *
 * Unicode name is "LATIN SMALL LETTER ESH" and glyph is: "ʃ"
 *
 * Used to create substitutions for JSP opening tags.
 */
const BLOCK_OPEN = '\u0283';

/**
 * Valid identifier character (has property "ID Start") which we can assume is
 * very likely unused in liferay-portal.
 *
 * Unicode name is "LATIN SMALL LETTER SQUAT REVERSED ESH" and glyph is: "ʅ"
 *
 * Used to create substitutions for JSP opening tags.
 */
const BLOCK_CLOSE = '\u0285';

const MINIMUM_OPENING_TAG_LENGTH = '<a:b>'.length;

const MINIMUM_SELF_CLOSING_TAG_LENGTH = '<a:b/>'.length;

/**
 * Create a same-length substitution for the text of the opening tag, `tag`.
 *
 * For example:
 *
 *     <foo:tag attr="this">  ...becomes:
 *     if (ʃʃʃʃʃʃʃʃʃʃʃʃʃʃ) {
 *
 * If the tag is too short to fit in the substitution, a best effort is made:
 *
 *     <a:b>     ...becomes:
 *     if (ʃ) {
 */
function getOpenTagReplacement(tag) {
	const fill = contents => `if (${contents}) {`;

	const templateLength = fill('').length;

	if (tag.length < MINIMUM_OPENING_TAG_LENGTH) {
		throw new Error(`Invalid (underlength) tag: ${tag}`);
	}

	const trimAmount = Math.min(
		tag.length - Math.max(0, tag.length - templateLength),
		tag.length - 1 /* Never trim a short tag away to nothing */
	);

	return fill(toFiller(tag, BLOCK_OPEN).slice(trimAmount));
}

///
//
// Create a same-length substitution for the text of the closing tag, `tag`.
//
// For example:
//
//     </foo:tag>  ...becomes:
//     }/*ʅʅʅʅʅ*/
//
// Unlike getOpenTagReplacement(), even the shortest possible closing tag has a
// same-length substitution:
//
//     </a:b>     ...becomes:
//     }/*ʅ*/
//
function getCloseTagReplacement(tag) {
	const fill = contents => `}/*${contents}*/`;

	const templateLength = fill('').length;

	if (tag.length < templateLength + 1) {
		throw new Error(`Invalid (underlength) tag: ${tag}`);
	}

	return fill(toFiller(tag, BLOCK_CLOSE).slice(templateLength));
}

///
//
// Create a same-length substitution for the text of the self-closing tag,
// `tag`.
//
// For example:
//
//     <foo:bar/>  ...becomes:
//     /*╳╳╳╳╳╳*/
//
function getSelfClosingTagReplacement(tag) {
	if (tag.length < MINIMUM_SELF_CLOSING_TAG_LENGTH) {
		throw new Error(`Invalid (underlength) tag: ${tag}`);
	}

	return `/*${toFiller(tag.slice(4))}*/`;
}

module.exports = {
	BLOCK_CLOSE,
	BLOCK_OPEN,

	getCloseTagReplacement,
	getOpenTagReplacement,
	getSelfClosingTagReplacement
};
