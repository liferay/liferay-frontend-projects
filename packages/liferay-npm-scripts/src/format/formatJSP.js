/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const prettier = require('prettier');
const getMergedConfig = require('../utils/getMergedConfig');
const extractJS = require('./extractJS');
const dedent = require('./dedent');
const indent = require('./indent');
const padLines = require('./padLines');
const restoreTags = require('./restoreTags');
const stripIndents = require('./stripIndents');
const substituteTags = require('./substituteTags');

const {PADDING_LINE} = padLines;

function formatJSP(source, prettierConfig = getMergedConfig('prettier')) {
	const blocks = extractJS(source);

	// TODO: lint for <(aui:)?script> not followed by newline (there are basically none in liferay-portal)
	const transformed = blocks.map(block => {
		const {contents, range} = block;

		// Prettier will trim empty first and last lines, but we need to keep
		// them around (need to preserve typical linebreak after opening tag,
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

		// Turn JSP tags, expressions (etc) into (valid JS) placeholders.
		const [substituted, tags] = substituteTags(dedented);

		// Strip internal JSP-related indents.
		const stripped = stripIndents(substituted);

		// Adjust line numbers for better error reporting.
		const padded = padLines(stripped, range.start.line - 1);

		const prettierOptions = {
			...prettierConfig,
			parser: 'babel'
		};

		// TODO: deal with Prettier moving comments; eg.
		//
		//      }
		//      <c:if>
		//          else {
		//
		// (<c:if> comment gets moved inside the else,
		// unless comment is on same line as "}"
		const formatted = prettier.format(padded, prettierOptions);

		// Remove previously inserted padding lines.
		const unpadded = formatted.replace(PADDING_LINE, '');

		// Replace placeholders with their corresponding original JSP tokens.
		const restored = restoreTags(unpadded, tags);

		// Restore base indent.
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
