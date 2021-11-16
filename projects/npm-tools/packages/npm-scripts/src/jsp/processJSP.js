/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const dedent = require('./dedent');
const extractJS = require('./extractJS');
const indent = require('./indent');
const padLines = require('./padLines');
const restoreTags = require('./restoreTags');
const stripIndents = require('./stripIndents');
const substituteTags = require('./substituteTags');
const trim = require('./trim');

const {PADDING_LINE} = padLines;

/**
 * Applies linting and formatting to the JSP `source` string.
 *
 * Currently, the only processable elements are script tags.
 */
async function processJSP(source, {onFormat, onLint, onMinify}) {
	const blocks = extractJS(source);

	// TODO: may want to pass filename here too, but I am not sure.

	if (!blocks.length) {
		return source;
	}

	// TODO: lint for <(aui:)?script> not followed by newline (there are basically none in liferay-portal)

	const transformed = [];

	for (const block of blocks) {
		const {contents, openTag, range} = block;

		// Script content should be indented one tab more than the opening tag.

		const baseIndent = range.start.column - openTag.length;

		// Trim leading and trailing whitespace before Prettier eats it.

		const {prefix, suffix, trimmed} = trim(contents);

		// Strip base indent.

		const dedented = dedent(trimmed);

		// Turn JSP tags, expressions (etc) into (valid JS) placeholders.

		const [substituted, tags] = substituteTags(dedented);

		// Strip internal JSP-related indents.

		const stripped = stripIndents(substituted);

		// Adjust line numbers for better error reporting.

		const padded = padLines(stripped, range.start.line);

		// (Optionally) actually lint.

		const fixed = onLint ? onLint(padded) : padded;

		// (Optionally) actually format.

		const formatted = onFormat ? onFormat(fixed) : fixed;

		// (Optionally) actually minify.

		const minified = onMinify ? await onMinify(formatted) : formatted;

		// Remove previously inserted padding lines.

		const unpadded = minified.replace(PADDING_LINE, '');

		// Replace placeholders with their corresponding original JSP tokens.

		const restored = restoreTags(unpadded, tags);

		// Restore base indent.

		const indented = onMinify ? restored : indent(restored, baseIndent);

		transformed.push({
			...block,
			contents:
				(onMinify ? '' : prefix || '\n') +
				indented +
				(onMinify ? '' : suffix || '\t'.repeat(baseIndent - 1)),
		});
	}

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

module.exports = processJSP;
