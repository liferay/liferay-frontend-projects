/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const prettier = require('prettier');
const extractJS = require('./extractJS');
const dedent = require('./dedent');
const indent = require('./indent');
const restoreTags = require('./restoreTags');
const stripIndents = require('./stripIndents');
const substituteTags = require('./substituteTags');

function formatJSP(source) {
	const blocks = extractJS(source);

	// TODO: lint for <(aui:)?script> not followed by newline (there are basically none in liferay-portal)
	const transformed = blocks.map(block => {
		const {contents} = block;

		// Prettier will trim empty first and last lines, but we need to keep
		// them around (neded to preserve typical linebreak after opening tag,
		// and the indent before closing tag, which is also typically
		// on a line of its own).
		let prefix = '';

		let suffix = '';

		const trimmed = contents.replace(
			/^\s*(\r\n|\n)|(?:\r?\n)([ \t]*$)/g,
			(match, leadingWhitespace, trailingWhitespace) => {
				if (leadingWhitespace) {
					prefix = leadingWhitespace;
				} else if (trailingWhitespace) {
					suffix = trailingWhitespace;
				}
				return match;
			}
		);

		// Strip base indent.
		const dedented = dedent(trimmed);

		const tabCount = dedent.lastMinimum;

		const [substituted, tags] = substituteTags(dedented);

		const stripped = stripIndents(substituted);

		// TODO: read these dynamically; only "parser" is different
		const prettierOptions = {
			bracketSpacing: false,
			endOfLine: 'lf',
			jsxSingleQuote: false,
			parser: 'babel',
			singleQuote: true,
			tabWidth: 4,
			trailingComma: 'none',
			useTabs: true
		};

		// TODO: deal with Prettier moving comments; eg.
		//
		//      }
		//      <c:if>
		//          else {
		//
		// (<c:if> comment gets moved inside the else,
		// unless comment is on same line as "}"
		const formatted = prettier.format(stripped, prettierOptions);

		const restored = restoreTags(formatted, tags);

		const indented = indent(restored, tabCount);

		return {
			...block,
			contents: prefix + indented + suffix
		};
	});

	let result = source;

	for (let i = transformed.length - 1; i >= 0; i--) {
		const {closeTag, contents, openTag, range} = transformed[i];
		const {index, length} = range;

		result =
			result.slice(0, index) +
			openTag +
			contents +
			closeTag +
			result.slice(index + length);
	}

	return result;
}

module.exports = formatJSP;
