/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const AUI_SCRIPT = /(<(aui:)?script(.*?)>)(.*?)<\/\2script>/s;

const AUI_SCRIPT_G = new RegExp(AUI_SCRIPT.source, 'gs');

const NEWLINE = /\r?\n/;

/**
 * Extracts a series of script blocks from a JSP source string.
 */
function extractJS(source) {
	const blocks = [];

	if (AUI_SCRIPT.test(source)) {
		source.replace(
			AUI_SCRIPT_G,
			(
				match,
				openTag,
				tagNamespace,
				scriptAttributes,
				body,
				offset,
				string
			) => {
				if (body) {
					const prefix = string.slice(0, offset + openTag.length);

					const prefixLines = prefix.split(NEWLINE);

					const lastPrefixLine = getLast(prefixLines);

					const contentLines = body.split(NEWLINE);

					const lastContentLine = getLast(contentLines);

					// Handle edge case where the openTag and the content all
					// fit on one line (eg. <script>code();</script>).
					const lastLine =
						contentLines.length === 1
							? lastPrefixLine + lastContentLine
							: lastContentLine;

					blocks.push({
						contents: body,
						match,
						scriptAttributes,
						range: {
							end: {
								column: lastLine.length + 1,
								line:
									prefixLines.length + contentLines.length - 1
							},
							start: {
								column: lastPrefixLine.length + 1,
								line: prefixLines.length
							}
						},
						tagNamespace
					});
				}
			}
		);
	}

	return blocks;
}

/**
 * Returns the last element in `array`.
 */
function getLast(array) {
	return array[array.length - 1];
}

module.exports = extractJS;
