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
const trim = require('./trim');

const {PADDING_LINE} = padLines;

/**
 * Formats the JSP `source` string.
 *
 * Returns `null` if the string doesn't contain any formattable elements
 * (currently, the only formattable elements are script tags).
 */
function formatJSP(source, prettierConfig = getMergedConfig('prettier')) {
	const blocks = extractJS(source);

	// TODO: may want to pass filename here too, but I am not sure.
	if (!blocks.length) {
		return null;
	}

	const prettierOptions = {
		...prettierConfig,
		parser: 'babel'
	};

	// TODO: lint for <(aui:)?script> not followed by newline (there are basically none in liferay-portal)
	const transformed = blocks.map(block => {
		const {contents, range} = block;

		// Trim leading and trailing whitespace before Prettier eats it.
		const {prefix, suffix, trimmed} = trim(contents);

		// Strip base indent.
		const [dedented, tabCount] = dedent(trimmed);

		// Turn JSP tags, expressions (etc) into (valid JS) placeholders.
		const [substituted, tags] = substituteTags(dedented);

		// Strip internal JSP-related indents.
		const stripped = stripIndents(substituted);

		// Adjust line numbers for better error reporting.
		const padded = padLines(stripped, range.start.line - 1);

		// Actually format.
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

	let result = '';
	let lastIndex = 0;

	for (let i = 0; i < transformed.length; i++) {
		const {closeTag, contents, openTag, range} = transformed[i];
		const {index, length} = range;

		result +=
			source.slice(lastIndex, index) + openTag + contents + closeTag;

		lastIndex = index + length;
	}

	return result + source.slice(lastIndex);
}

module.exports = formatJSP;
