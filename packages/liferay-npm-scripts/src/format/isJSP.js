/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const JSP_EXTENSIONS = new Set(['.jsp', '.jspf']);

/**
 * Returns true if `filepath` refers to a JSP file.
 */
function isJSP(filepath) {
	const extension = path.extname(filepath).toLowerCase();

	return JSP_EXTENSIONS.has(extension);
}

module.exports = isJSP;
