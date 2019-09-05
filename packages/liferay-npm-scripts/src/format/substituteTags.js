/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getPaddedReplacement = require('./getPaddedReplacement');
const toWhitespace = require('./toWhitespace');

const JSP_DIRECTIVE = /<%@.+?%>/g;

const JSP_EXPRESSION = /<%=.+?%>/g;

const JSP_PORTLET_NAMESPACE = /<portlet:namespace\s*\/>/g;

const JSP_SCRIPTLET = /<%(.*?)%>/gs;

/**
 * Recognize EL (Expression Language) expression syntax.
 *
 * In a nutshell:
 *
 * - ${expr}: immediate evaluation.
 * - #{expr}: deferred evaluation.
 * - \${expr}: escaped; no special meaning.
 * - \#{expr}: escaped; no special meaning.
 *
 * Conveniently, EL expressions cannot be nested.
 *
 * @see https://en.wikipedia.org/wiki/Unified_Expression_Language
 * @see https://download.oracle.com/otndocs/jcp/el-3_0-fr-eval-spec/index.html
 */
const EL_EXPRESSION = /(?<!\\)(?:[$#])\{[^}]+\}/g;

/**
 * Takes a source string and substitutes valid placeholder JavaScript for any
 * JSP tags.
 *
 * Assumes basically "well-formed" input (eg. nothings crazy like tags which
 * open strings but don't close them etc).
 */
function substituteTags(source) {
	let expressionCount = 0;

	const transforms = new Map([
		[
			EL_EXPRESSION,
			match => {
				return getPaddedReplacement(match, `EL_${expressionCount++}`);
			}
		],
		[
			JSP_DIRECTIVE,
			match => {
				return getPaddedReplacement(match, 'JSP_DIR');
			}
		],
		[
			JSP_EXPRESSION,
			match => {
				return getPaddedReplacement(match, 'JSP_EXPR');
			}
		],
		[
			JSP_SCRIPTLET,
			(_match, inner) => {
				return `/*${toWhitespace(inner)}*/`;
			}
		],
		[
			JSP_PORTLET_NAMESPACE,
			match => {
				return getPaddedReplacement(match, 'PORTLET_NAMESPACE');
			}
		]
	]);

	const tags = [];

	const text = [...transforms.entries()].reduce(
		(output, [pattern, replacer]) => {
			return output.replace(pattern, (match, ...rest) => {
				rest.pop(); // Ignore whole string.

				const offset = rest.pop();
				const groups = rest;

				// Remember position where we saw each tag, because we see them
				// in pattern-application order, not document order.
				tags.push([match, offset]);

				return replacer(match, ...groups, offset);
			});
		},
		source
	);

	// Sort tags into document-order.
	tags.sort(([, a], [, b]) => {
		return a < b ? -1 : a > b ? 1 : 0;
	});

	return [text, tags.map(([tag]) => tag)];
}

module.exports = substituteTags;
