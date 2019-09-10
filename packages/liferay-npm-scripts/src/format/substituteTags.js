/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getPaddedReplacement = require('./getPaddedReplacement');
const lex = require('./lex');
const {
	getCloseTagReplacement,
	getOpenTagReplacement,
	getSelfClosingTagReplacement
} = require('./tagReplacements');
const toFiller = require('./toFiller');

/**
 * Takes a source string and substitutes valid placeholder JavaScript for any
 * JSP tags.
 *
 * Assumes basically "well-formed" input (eg. nothings crazy like tags which
 * open strings but don't close them etc).
 */
function substituteTags(source) {
	let expressionCount = 0;

	const tags = [];

	const tokens = lex(source);

	const substituted = tokens
		.map(({contents, index, name}) => {
			// Provisionally assume that "contents" corresponds to a tag that we're
			// going to substitute.
			tags.push(contents);

			switch (name) {
				case 'CUSTOM_ACTION':
					return getSelfClosingTagReplacement(contents);

				case 'CUSTOM_ACTION_END':
					return getCloseTagReplacement(contents);

				case 'CUSTOM_ACTION_START':
					return getOpenTagReplacement(contents);

				case 'EL_EXPRESSION':
					return getPaddedReplacement(
						contents,
						`EL_${expressionCount++}`
					);

				case 'JSP_DIRECTIVE':
					return getPaddedReplacement(contents, 'JSP_DIR');

				case 'JSP_EXPRESSION':
					return getPaddedReplacement(contents, 'JSP_EXPR');

				case 'JSP_SCRIPTLET':
					return `/*${toFiller(contents.slice(2, -2))}*/`;

				case 'PORTLET_NAMESPACE':
					return getPaddedReplacement(contents, 'PORTLET_NAMESPACE');

				case 'TEMPLATE_TEXT':
					tags.pop();
					return contents;
			}
		})
		.join('');

	return [substituted, tags];
}

module.exports = substituteTags;
