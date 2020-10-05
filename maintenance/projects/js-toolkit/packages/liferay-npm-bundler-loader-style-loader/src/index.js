/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * @param {object} context loader's context
 * @return {string} the processed file content
 */
export default function (context) {
	const {filePath, log} = context;
	let {content} = context;

	content = content.replace(/\\/g, '\\\\');
	content = content.replace(/\r/g, '\\n');
	content = content.replace(/\n/g, '\\n');
	content = content.replace(/"/g, '\\"');

	context.extraArtifacts[`${filePath}.js`] = `
var css = "${content}";
var style = document.createElement("style");
style.setAttribute("type", "text/css");
style.appendChild(document.createTextNode(css));
document.querySelector("head").appendChild(style);
`;

	log.info('style-loader', `Generated JavaScript CSS module`);
}
