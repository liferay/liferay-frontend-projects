/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * @param {object} context loader's context
 * @return {string} the processed file content
 */
export default function(context) {
	const {content, filePath} = context;

	context.extraArtifacts[`${filePath}.js`] = `
var css = "${content.replace(/\n/g, '')}";
var style = document.createElement("style");
style.setAttribute("type", "text/css");
style.appendChild(document.createTextNode(css));
document.querySelector("head").appendChild(style);
`;
}
