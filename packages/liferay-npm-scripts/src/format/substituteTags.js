/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getPaddedReplacement = require('./getPaddedReplacement');
const {
	getCloseTagReplacement,
	getOpenTagReplacement,
	getSelfClosingTagReplacement
} = require('./tagReplacements');
const toFiller = require('./toFiller');

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

const JSP_DIRECTIVE = /<%@.+?%>/g;

const JSP_EXPRESSION = /<%=.+?%>/g;

const JSP_PORTLET_NAMESPACE = /<portlet:namespace\s*\/>/g;

const JSP_SCRIPTLET = /<%(.*?)%>/gs;

const JSP_OPEN_TAG = /<[A-Za-z0-9-_]+:[^>]+>/g;

const JSP_CLOSE_TAG = /<\/[A-Za-z0-9-_]+:[^>]+>/g;

const JSP_SELF_CLOSING_TAG = /<[A-Za-z0-9-_]+:[^>]+\/>/g;

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
		[JSP_DIRECTIVE, match => getPaddedReplacement(match, 'JSP_DIR')],
		[JSP_EXPRESSION, match => getPaddedReplacement(match, 'JSP_EXPR')],
		[JSP_SCRIPTLET, (_match, inner) => `/*${toFiller(inner)}*/`],
		[
			JSP_PORTLET_NAMESPACE,
			match => getPaddedReplacement(match, 'PORTLET_NAMESPACE')
		],
		[JSP_SELF_CLOSING_TAG, getSelfClosingTagReplacement],
		[
			// TODO: may want to consider a fallback here
			// try parsing with this substitution, and if it doesn't work, do
			// the dumber comment-based one
			JSP_OPEN_TAG,
			getOpenTagReplacement
		],
		[JSP_CLOSE_TAG, getCloseTagReplacement],
		[
			EL_EXPRESSION,
			match => getPaddedReplacement(match, `EL_${expressionCount++}`)
		]
	]);

	const tags = [];

	const text = [...transforms.entries()].reduce(
		(output, [pattern, replacer]) => {
			// As we build the replacement string, possibly inserting additional
			// characters, the offsets we receive reference positions in the
			// original string, so may be invalid. Track the error and correct
			// for it.
			let adjustment = 0;

			return output.replace(pattern, (match, ...rest) => {
				rest.pop(); // Ignore last param (whole string).

				// BUG: indices can be invalidate by subsequent
				// substitutions albeit unlikely (in any case, to deal
				// with nesting, need to start dealing with RANGES and
				// checking for overlap)
				const [offset, length] = [rest.pop(), match.length];
				const groups = rest;

				// Remember position where we saw each tag, because we see them
				// in pattern-application order, not document order.
				tags.push([match, offset + adjustment, length]);

				const replacement = replacer(match, ...groups);

				adjustment += replacement.length - match.length;

				return replacement;
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
