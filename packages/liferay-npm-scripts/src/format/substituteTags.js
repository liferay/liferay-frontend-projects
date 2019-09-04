/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const JSP_PORTLET_NAMESPACE = /<portlet:namespace\s*\/>/g;

const JSP_SCRIPT_BLOCK = /<%.*?%>/g;

const JSP_SCRIPTLET_BLOCK = /<%=.*?%>/g;

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

	return source
		.replace(EL_EXPRESSION, match => {
			return `_EL_EXPRESSION_${expressionCount++}`;
		})
		.replace(JSP_SCRIPTLET_BLOCK, '_ECHO_SCRIPTLET_')
		.replace(JSP_SCRIPT_BLOCK, '_SCRIPTLET_')
		.replace(JSP_PORTLET_NAMESPACE, match => {
			// Make substitution length the same as the original text.
			return '_PORTLET_NAMESPACE_________'.slice(0, match.length);
		});
}

module.exports = substituteTags;
