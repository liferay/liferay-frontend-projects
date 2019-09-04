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

	return source
		.replace(EL_EXPRESSION, match => {
			return getPaddedReplacement(match, `_EL_${expressionCount++}_`);
		})
		.replace(JSP_DIRECTIVE, '_JSP_DIR_')
		.replace(JSP_EXPRESSION, match => {
			return getPaddedReplacement(match, '_JSP_EXPR_');
		})
		.replace(JSP_SCRIPTLET, (_match, inner) => {
			return `/*${toWhitespace(inner)}*/`;
		})
		.replace(JSP_PORTLET_NAMESPACE, match => {
			return getPaddedReplacement(match, '_PORTLET_NAMESPACE_');
		});
}

module.exports = substituteTags;
