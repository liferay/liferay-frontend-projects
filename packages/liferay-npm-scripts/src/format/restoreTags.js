/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const Lexer = require('./Lexer');
const dedent = require('./dedent');
const {IDENTIFIER} = require('./getPaddedReplacement');
const indent = require('./indent');
const {CLOSE_TAG, OPEN_TAG} = require('./tagReplacements');
const {FILLER, TAB_CHAR} = require('./toFiller');

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
		const SELF_CLOSING_TAG_REPLACEMENT = match(FILLER);
		const CLOSE_TAG_REPLACEMENT = match(CLOSE_TAG);
		const IDENTIFIER_REPLACEMENT = match(IDENTIFIER);
		const OPEN_TAG_REPLACEMENT = match(OPEN_TAG);
		const NEWLINE = match(/\r?\n/);
		const WHITESPACE = match(/[ \t]+/);

		return choose({
			/* eslint-disable sort-keys */
			SELF_CLOSING_TAG_REPLACEMENT,
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

	let tokens = [...lexer.lex(source)];

	// First pass: restore internal indents related to JSP entities
	// (ie. undo the effects of `stripIndents()`.
	for (let i = 0; i < tokens.length; i++) {
		const {contents, name} = tokens[i];

		switch (name) {
			case 'OPEN_TAG_REPLACEMENT':
				output += indent + contents;
				indentLevel++;
				break;

			case 'CLOSE_TAG_REPLACEMENT':
				indent = indent.slice(1);
				output += indent + contents;
				indentLevel--;
				break;

			case 'IDENTIFIER_REPLACEMENT':
			case 'SELF_CLOSING_TAG_REPLACEMENT':
				output += indent + contents;
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

	// Second pass: re-insert JSP tags into source.
	tokens = [...lexer.lex(output)];
	output = '';

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		const {contents, name} = token;

		switch (name) {
			case 'OPEN_TAG_REPLACEMENT':
			case 'CLOSE_TAG_REPLACEMENT':
			case 'IDENTIFIER_REPLACEMENT':
			case 'SELF_CLOSING_TAG_REPLACEMENT':
				output += getIndentedTag(tags[restoreCount++], token);
				break;

			case 'ANYTHING':
			case 'COMMENT':
			case 'NEWLINE':
			case 'WHITESPACE':
				output += contents;
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

/**
 * Based on preceding indent, adjust the internal indent of a tag before
 * substituting it.
 *
 * For example, this source:
 *
 *      \t\t\t\t\t\t<%
 *      \t\t\t\t\t\t// Contents
 *      \t\t\t\t\t\t%>
 *
 * May be changed by Prettier to:
 *
 *      \t\t<%
 *      \t\t\t\t\t\t// Contents
 *      \t\t\t\t\t\t%>
 *
 * So this function must correct that to:
 *
 *      \t\t<%
 *      \t\t// Contents
 *      \t\t%>
 *
 * Necessary because Prettier will often change the first line of multi-line
 * placeholder comment, but it never changes the subsequent lines.
 */
function getIndentedTag(tag, token) {
	if (!token.previous) {
		return tag;
	}

	let previous;

	const {contents, name} = token.previous;

	if (name === 'WHITESPACE') {
		previous = contents;
	} else if (name === 'NEWLINE') {
		previous = '';
	} else {
		return tag;
	}

	// This is incredibly hacky, so strap yourself in:
	//
	// We know the size of the indent (the "previous" token)
	// after formatting, but we don't know the size it was before
	// formatting. Let's call that unknown size "X": what we want to
	// calculate is "X - previous", because that is the amount that
	// Prettier changed the indent, and which we'll need to change
	// the other lines by as well.
	//
	// We don't know "X" but we can make a best guess based on the
	// following assumptions (which we can expect to be valid only
	// because the Java Source Formatter enforces them):
	//
	// - "X" will always be a sequence of tabs.
	// - The indent of the last line (call that "Y") should be the same as
	//   "X".
	//
	// Seeing as we can figure out "Y", we can use that as our guess for
	// "X".

	const lines = token.contents.split(/\r?\n/g);

	if (lines.length > 1) {
		// Look at last line to figure out original indent.
		const last = lines.pop();
		const {0: original} = last.match(new RegExp(`^${TAB_CHAR}*`));

		// Restore original indent to first line, then dedent the whole tag.
		const [dedented] = dedent('\t'.repeat(original.length) + tag);

		// And indent it to the correct level, but trim off the indent on
		// the first line because we already emitted that.
		return indent(dedented, 1, previous).replace(previous, '');
	}

	return tag;
}

module.exports = restoreTags;
