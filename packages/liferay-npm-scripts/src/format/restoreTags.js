/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {ID_END, ID_START} = require('./getPaddedReplacement');
const {BLOCK_CLOSE, BLOCK_OPEN} = require('./tagReplacements');
const {FILLER} = require('./toFiller');

const COMMENT = `/\\*[${FILLER}\\s]+\\*/`;

// TODO handle multi-line opening tags, which have a comment after the
// conditional
const OPEN_TAG_REPLACEMENT = `if \\(\\s*${BLOCK_OPEN}+\\s*\\) \\{`;

const CLOSE_TAG_REPLACEMENT = `\\}/\\*${BLOCK_CLOSE}+\\*/`;

const IDENTIFIER = `${ID_START}[^${ID_END}]+${ID_END}`;

const SUBSTITUTIONS = new RegExp(
	[COMMENT, CLOSE_TAG_REPLACEMENT, OPEN_TAG_REPLACEMENT, IDENTIFIER].join(
		'|'
	),
	'g'
);

/**
 * Takes a source string and reinserts tags that were previously extracted with
 * substituteTags().
 */
function restoreTags(text, tags) {
	let count = 0;

	// BUG: nested JSP exp gets subbed and added to tags
	// then the JSP tag containing it gets subbed and added to tags...

	const result = text.replace(SUBSTITUTIONS, match => {
		// Edge case: skip over comments that contain only whitespace;
		// all legit substituted comments will have at least one FILLER char.
		if (match.startsWith('/*') && !match.includes(FILLER)) {
			return match;
		}

		return tags[count++];
	});

	if (count !== tags.length) {
		throw new Error(
			`Expected replacement count ${count}, but got ${tags.length}`
		);
	}

	return result;
}

module.exports = restoreTags;
