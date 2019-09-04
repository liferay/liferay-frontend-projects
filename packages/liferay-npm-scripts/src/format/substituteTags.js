/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const JSP_PORTLET_NAMESPACE = /<portlet:namespace\s*\/>/g;

const JSP_SCRIPT_BLOCK = /<%.*?%>/g;

const JSP_SCRIPTLET_BLOCK = /<%=.*?%>/g;

/**
 * Takes a source string and substitutes valid placeholder JavaScript for any
 * JSP tags.
 *
 * Assumes basically "well-formed" input (eg. nothings crazy like tags which
 * open strings but don't close them etc).
 */
function substituteTags(source) {
	return source
		.replace(JSP_SCRIPTLET_BLOCK, '_ECHO_SCRIPTLET_')
		.replace(JSP_SCRIPT_BLOCK, '_SCRIPTLET_')
		.replace(JSP_PORTLET_NAMESPACE, match => {
			// Make substitution length the same as the original text.
			return '_PORTLET_NAMESPACE_________'.slice(0, match.length);
		});
}

module.exports = substituteTags;
