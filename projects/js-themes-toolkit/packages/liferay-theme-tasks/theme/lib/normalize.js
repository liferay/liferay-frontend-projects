/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/**
 * "Normalize" an HTML template by adding JS-injection placeholders as
 * HTML comments at the end of the template <body>.
 *
 * @param {string} template
 * @return {string}
 */
function normalize(template) {
	const beforeRegex = /<\/body>/;

	const replacementContent = '<!-- inject:js -->\n<!-- endinject -->\n\n';

	if (template.indexOf(replacementContent) === -1) {
		template = template.replace(beforeRegex, match => {
			return replacementContent + match;
		});
	}

	return template;
}

module.exports = normalize;
