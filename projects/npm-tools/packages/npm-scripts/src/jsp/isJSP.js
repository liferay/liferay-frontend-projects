/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const hasExtension = require('../utils/hasExtension');

const JSP_EXTENSIONS = new Set(['.jsp', '.jspf']);

/**
 * Returns true if `filepath` refers to a JSP file.
 */
function isJSP(filepath) {
	return hasExtension(filepath, JSP_EXTENSIONS);
}

module.exports = isJSP;
