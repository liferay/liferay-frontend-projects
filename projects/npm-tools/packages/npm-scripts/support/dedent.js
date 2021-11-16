/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Helper function to make tests (a bit) more readable.
 *
 * Removes `tabs` of indent from each line.
 */
function dedent(tabs) {
	const indent = '\t'.repeat(tabs);

	const regExp = new RegExp(`^${indent}`, 'gm');

	return (strings, ...interpolations) => {
		if (interpolations.length) {
			throw new Error('Unsupported interpolation in template literal');
		}

		return strings[0].replace(regExp, '');
	};
}

module.exports = dedent;
