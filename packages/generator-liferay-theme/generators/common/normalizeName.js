/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const splitWords = require('./splitWords');

/**
 * Returns a normalized "kebab case" version of the supplied string, suitable
 * for use as a theme (or themelet, or layout) name.
 */
function normalizeName(name) {
	return splitWords(name.replace(/[^a-z0-9-]/gi, ''))
		.join('-')
		.toLowerCase();
}

module.exports = normalizeName;
