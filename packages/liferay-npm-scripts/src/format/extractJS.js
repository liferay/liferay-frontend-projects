/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const AUI_SCRIPT = /<(aui:)?script(.*?)>(.*?)<\/\1script>/s;

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
			(match, tagNamespace, scriptAttributes, body, offset, string) => {
				if (body) {
					const startLine = string.slice(0, offset).split(NEWLINE)
						.length;

					blocks.push({
						contents: body,
						match,
						scriptAttributes,
						startLine,
						tagNamespace
					});
				}
			}
		);
	}

	return blocks;
}

module.exports = extractJS;
