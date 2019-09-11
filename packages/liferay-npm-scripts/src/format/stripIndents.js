/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const Lexer = require('./Lexer');
const {CLOSE_TAG, OPEN_TAG} = require('./tagReplacements');

///
//
// Given `source` that has previously been processed by `substituteTags`,
// this function locates the placeholders that have been inserted to stand in
// for JSP opening and closing tags, and strips off the leading indents between
// them, effectively matching what Prettier would do anyway on seeing them.
//
// That is, given initial input:
//
//      <my:tag>
//          if (foo) {
//              alert('foo!');
//          }
//      </my:tag>
//
// `substituteTags()` will insert placeholders that are based on comments:
//
//      /* open placeholder */
//          if (foo) {
//              alert('foo!');
//          }
//      /* close placeholder */
//
// When piped through Prettier, the tag contents will get dedented:
//
//      /* open placeholder */
//      if (foo) {
//          alert('foo!');
//      }
//      /* close placeholder */
//
// So, this function does the same.
function stripIndents(source) {
	const lexer = new Lexer(api => {
		const {consume, match, peek, token} = api;

		const ANYTHING = match(/[\s\S]/);
		const CLOSE_TAG_REPLACEMENT = match(CLOSE_TAG);
		const NEWLINE = match(/\r?\n/);
		const OPEN_TAG_REPLACEMENT = match(OPEN_TAG);
		const WHITESPACE = match(/[ \t]+/);

		return () => {
			if (peek(OPEN_TAG_REPLACEMENT)) {
				return token('OPEN_TAG', consume(OPEN_TAG_REPLACEMENT));
			} else if (peek(CLOSE_TAG_REPLACEMENT)) {
				return token('CLOSE_TAG', consume(CLOSE_TAG_REPLACEMENT));
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
	let indentLevel = 0;

	const tokens = [...lexer.lex(source)];

	for (let i = 0; i < tokens.length; i++) {
		const {name, contents} = tokens[i];

		switch (name) {
			case 'OPEN_TAG':
				output += contents;
				indentLevel++;
				break;

			case 'CLOSE_TAG':
				indentLevel--;
				output += contents;
				break;

			case 'NEWLINE':
				{
					output += contents;

					// Peek ahead to see if the next token is whitespace,
					// and trim it if necessary.
					const [maybeWhitespace, maybeCloseTag] = tokens.slice(
						i + 1,
						i + 3
					);

					if (
						maybeWhitespace &&
						maybeWhitespace.name === 'WHITESPACE'
					) {
						let trimCount = indentLevel;

						if (
							maybeCloseTag &&
							maybeCloseTag.name === 'CLOSE_TAG'
						) {
							trimCount = indentLevel - 1;
						}

						output += maybeWhitespace.contents.replace(
							new RegExp(`^\t{0,${trimCount}}`),
							''
						);

						i++;
					}
				}

				break;

			case 'ANYTHING':
			case 'WHITESPACE':
				output += contents;
				break;

			default:
				throw new Error(`Unexpected token type: ${name}`);
		}
	}

	return output;
}

module.exports = stripIndents;
