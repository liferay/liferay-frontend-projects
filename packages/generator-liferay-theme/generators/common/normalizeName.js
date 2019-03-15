/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

/**
 * Returns a normalized "kebab case" version of the supplied string, suitable
 * for use as a theme (or themelet, or layout) name.
 */
function normalizeName(name) {
	return name
		.trim()
		.replace(/\s+/g, '-')
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, '');
}

module.exports = normalizeName;
