/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const Lexer = require('./Lexer');
const {IDENTIFIER} = require('./getPaddedReplacement');
const {CLOSE_TAG, OPEN_TAG} = require('./tagReplacements');
const {FILLER} = require('./toFiller');

/**
 * Takes a source string and reinserts tags that were previously extracted with
 * substituteTags().
 */
function restoreTags(source, tags) {
	let restoreCount = 0;

	const lexer = new Lexer(api => {
		const {choose, match} = api;

		const ANYTHING = match(/[\s\S]/);
		const COMMENT = match(/\/\*.*?\*\//);
		const TAG_REPLACEMENT = match(FILLER);
		const CLOSE_TAG_REPLACEMENT = match(CLOSE_TAG);
		const IDENTIFIER_REPLACEMENT = match(IDENTIFIER);
		const OPEN_TAG_REPLACEMENT = match(OPEN_TAG);
		const NEWLINE = match(/\r?\n/);
		const WHITESPACE = match(/[ \t]+/);

		return choose({
			/* eslint-disable sort-keys */
			TAG_REPLACEMENT,
			OPEN_TAG_REPLACEMENT,
			CLOSE_TAG_REPLACEMENT,
			COMMENT,
			IDENTIFIER_REPLACEMENT,
			NEWLINE,
			WHITESPACE,
			ANYTHING
			/* eslint-enable sort-keys */
		});
	});

	let output = '';
	let indent = '';
	let indentLevel = 0;

	const tokens = [...lexer.lex(source)];

	for (let i = 0; i < tokens.length; i++) {
		const {contents, name} = tokens[i];

		switch (name) {
			case 'OPEN_TAG_REPLACEMENT':
				output += indent + tags[restoreCount++];
				indentLevel++;
				break;

			case 'CLOSE_TAG_REPLACEMENT':
				indent = indent.slice(1);
				output += indent + tags[restoreCount++];
				indentLevel--;
				break;

			case 'IDENTIFIER_REPLACEMENT':
			case 'TAG_REPLACEMENT':
				output += indent + tags[restoreCount++];
				indent = '';
				break;

			case 'ANYTHING':
			case 'COMMENT':
			case 'WHITESPACE':
				output += indent + contents;
				indent = '';
				break;

			case 'NEWLINE':
				{
					output += contents;

					// Peek ahead to see if the next non-whitespace token is a
					// closing tag, so that we can adjust the indentLevel
					// accordingly.
					const [maybeWhitespace, maybeCloseTag] = tokens.slice(
						i + 1,
						i + 3
					);

					if (
						maybeWhitespace &&
						maybeWhitespace.name === 'WHITESPACE' &&
						maybeCloseTag &&
						maybeCloseTag.name === 'CLOSE_TAG_REPLACEMENT'
					) {
						indent = '\t'.repeat(indentLevel - 1);
					} else {
						indent = '\t'.repeat(indentLevel);
					}
				}
				break;

			default:
				throw new Error(`Unexpected token type: ${name}`);
		}
	}

	if (restoreCount !== tags.length) {
		throw new Error(
			`Expected replacement count ${restoreCount}, but got ${tags.length}`
		);
	}

	return output;
}

module.exports = restoreTags;
