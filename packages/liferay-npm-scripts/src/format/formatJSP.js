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
	const result = source;

	const blocks = extractJS(source);

	// TODO: lint for <(aui:)?script> not followed by newline (there are basically none)
	blocks.forEach(({contents, range}) => {
		// Strip base indent
		const dedented = dedent(contents);
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

		return indented;
	});

	return result;
}

module.exports = formatJSP;
