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

///
// Create a same-length substitution for the text of the opening tag, `tag`.
//
// For example:
//
//     <foo:tag attr="this">
//                            ...becomes:
//     if (ʃʃʃʃʃʃʃʃʃʃʃʃʃʃ) {
//
// If the tag is too short to fit in the substitution, a best effort is made:
//
//     <a:b>
//               ...becomes:
//     if (ʃ) {
//
// If the tag spans multiple lines a best effort is made:
//
//     <foo-bar:tag
//         attr="word"
//     >
//                            ...becomes:
//     if (ʃʃʃʃʃ) {
//         /*ʃʃʃʃʃʃʃʃʃʃʃ
//     ʃ*/
//
function getOpenTagReplacement(tag) {
	if (tag.length < MINIMUM_OPENING_TAG_LENGTH) {
		throw new Error(`Invalid (underlength) tag: ${tag}`);
	}

	const [first, ...rest] = tag.split('\n');

	const fill = contents => `if (${contents}) {`;

	const templateLength = fill('').length;

	const trimAmount = Math.min(
		first.length - Math.max(0, first.length - templateLength),
		first.length - 1 /* Never trim a short tag away to nothing */
	);

	const conditional = fill(toFiller(first, BLOCK_OPEN).slice(trimAmount));

	let comment = null;

	if (rest.length) {
		const [, indent, remainder] = rest.join('\n').match(/(\s*)(.*)/s);

		// Rough-but-probably-harmless approximation: the filler will be
		// 4 characters too long, but safely trimming it is hard because
		// it may contain newlines.
		// TODO: make this smarter.
		comment = indent + `/*${toFiller(remainder, BLOCK_OPEN)}*/`;
	}

	return [conditional, comment].filter(Boolean).join('\n');
}

///
//
// Create a same-length substitution for the text of the closing tag, `tag`.
//
// For example:
//
//     </foo:tag>
//                 ...becomes:
//     }/*ʅʅʅʅʅ*/
//
// Unlike getOpenTagReplacement(), even the shortest possible closing tag has a
// same-length substitution:
//
//     </a:b>
//                ...becomes:
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
//     <foo:bar/>
//                 ...becomes:
//     /*╳╳╳╳╳╳*/
//
function getSelfClosingTagReplacement(tag) {
	if (tag.length < MINIMUM_SELF_CLOSING_TAG_LENGTH) {
		throw new Error(`Invalid (underlength) tag: ${tag}`);
	}

	return `/*${toFiller(tag.slice(2, -2))}*/`;
}

module.exports = {
	BLOCK_CLOSE,
	BLOCK_OPEN,

	getCloseTagReplacement,
	getOpenTagReplacement,
	getSelfClosingTagReplacement
};
