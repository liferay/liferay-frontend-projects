/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {ID_END, ID_START} = require('./getPaddedReplacement');
const {FILLER} = require('./toFiller');

const COMMENT = `/\\*[${FILLER}\\s]+\\*/`;
const IDENTIFIER = `${ID_START}[^${ID_END}]+${ID_END}`;
const SUBSTITUTIONS = new RegExp(`${COMMENT}|${IDENTIFIER}`, 'g');

/**
 * Takes a source string and reinserts tags that were previously extracted with
 * substituteTags().
 */
function restoreTags(text, tags) {
	let count = 0;

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
