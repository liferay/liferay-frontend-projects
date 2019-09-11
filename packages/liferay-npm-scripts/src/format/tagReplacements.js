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
 * Unicode name is "LATIN SMALL LETTER SQUAT REVERSED ESH" and glyph is: "ʅ"
 *
 * Used to create substitutions for JSP opening tags.
 */
const BLOCK_CLOSE = '\u0285';

/**
 * Valid identifier character (has property "ID Start") which we can assume is
 * very likely unused in liferay-portal.
 *
 * Unicode name is "LATIN SMALL LETTER ESH" and glyph is: "ʃ"
 *
 * Used to create substitutions for JSP opening tags.
 */
const BLOCK_OPEN = '\u0283';

const CLOSE_TAG = new RegExp(`/\\*\\s*[${BLOCK_CLOSE}\\s]+\\*/`);

const OPEN_TAG = new RegExp(`/\\*\\s*[${BLOCK_OPEN}\\s]+\\*/`);

const fill = contents => `/*${contents}*/`;

const templateLength = fill('').length;

const validate = tag => {
	if (tag.length <= templateLength) {
		throw new Error(`Invalid (underlength) tag: ${tag}`);
	}
};

///
// Create a same-length substitution for the text of the opening tag, `tag`.
//
// For example:
//
//     <foo:tag attr="this">
//                            ...becomes:
//     /*ʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃʃ*>
//
// Even the shortest possible tag has a same-length substitution:
//
//     <a:b>
//               ...becomes:
//     /*ʃ*/
//
// If the tag spans multiple lines a best effort is made:
//
//     <foo-bar:tag
//         attr="word"
//     >
//                            ...becomes:
//     /*ʃʃʃʃʃʃʃʃʃ
//         ʃʃʃʃʃʃʃʃʃʃʃ
//     */
//
function getOpenTagReplacement(tag) {
	validate(tag);

	// Trim more from beginning than end because first line will generally be
	// longer, and we don't want to cut off any newline before the final ">".
	return fill(toFiller(tag, BLOCK_OPEN).slice(3, -1));
}

///
//
// Create a same-length substitution for the text of the closing tag, `tag`.
//
// For example:
//
//     </foo:tag>
//                 ...becomes:
//     /*ʅʅʅʅʅʅ*/
//
// The shortest possible closing tag has a same-length substitution:
//
//     </a:b>
//                ...becomes:
//     /*ʅʅ*/
//
function getCloseTagReplacement(tag) {
	validate(tag);

	// Trim equally from beginning and end.
	return fill(toFiller(tag, BLOCK_CLOSE).slice(2, -2));
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
	validate(tag);

	// Trim equally from beginning and end.
	return fill(toFiller(tag.slice(2, -2)));
}

module.exports = {
	CLOSE_TAG,
	OPEN_TAG,

	getCloseTagReplacement,
	getOpenTagReplacement,
	getSelfClosingTagReplacement
};
