/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * @return Processed content
 */
export default function(content) {
	return [
		'var css = "' + content.replace(/\n/g, '') + '";',
		'var style = document.createElement("style");',
		'style.setAttribute("type", "text/css");',
		'style.appendChild(document.createTextNode(css));',
		'document.querySelector("head").appendChild(style);',
	].join('\n');
}
