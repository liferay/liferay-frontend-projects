/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const Lexer = require('./Lexer');
const {IDENTIFIER} = require('./getPaddedReplacement');
const {CLOSE_TAG, OPEN_TAG} = require('./tagReplacements');
const {COMMENT, FILLER} = require('./toFiller');

/**
 * Takes a source string and reinserts tags that were previously extracted with
 * substituteTags().
 */
function restoreTags(source, tags) {
	let restoreCount = 0;

	const lexer = new Lexer(api => {
		const {consume, match, peek, token} = api;

		const ANYTHING = match(/[\s\S]/);
		const COMMENT_REPLACEMENT = match(COMMENT);
		const CLOSE_TAG_REPLACEMENT = match(CLOSE_TAG);
		const IDENTIFIER_REPLACEMENT = match(IDENTIFIER);
		const OPEN_TAG_REPLACEMENT = match(OPEN_TAG);
		const NEWLINE = match(/\r?\n/);
		const WHITESPACE = match(/[ \t]+/);

		return () => {
			if (peek(COMMENT_REPLACEMENT)) {
				const text = consume();

				if (text.includes(FILLER)) {
					return token('TAG', text);
				} else {
					// Edge case: comments that contain only whitespace; all
					// legit substituted comments will have at least one
					// FILLER char.
					return token('COMMENT', text);
				}
			} else if (peek(OPEN_TAG_REPLACEMENT)) {
				return token('OPEN_TAG', consume(OPEN_TAG_REPLACEMENT));
			} else if (peek(CLOSE_TAG_REPLACEMENT)) {
				return token('CLOSE_TAG', consume(CLOSE_TAG_REPLACEMENT));
			} else if (peek(IDENTIFIER_REPLACEMENT)) {
				return token('IDENTIFIER', consume(IDENTIFIER_REPLACEMENT));
			} else if (peek(NEWLINE)) {
				return token('NEWLINE', consume(NEWLINE));
			} else if (peek(WHITESPACE)) {
				return token('WHITESPACE', consume(WHITESPACE));
			} else {
				return token('ANYTHING', consume(ANYTHING));
			}
		};
	});

	let output = '';
	let indent = '';
	let indentLevel = 0;

	const tokens = [...lexer.lex(source)];

	for (let i = 0; i < tokens.length; i++) {
		const {contents, name} = tokens[i];

		switch (name) {
			case 'OPEN_TAG':
				output += indent + tags[restoreCount++];
				indentLevel++;
				break;

			case 'CLOSE_TAG':
				indent = indent.slice(1);
				output += indent + tags[restoreCount++];
				indentLevel--;
				break;

			case 'IDENTIFIER':
			case 'TAG':
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
						maybeCloseTag.name === 'CLOSE_TAG'
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
