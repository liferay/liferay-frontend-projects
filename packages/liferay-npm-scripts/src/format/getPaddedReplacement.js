/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const PADDING = '_'.repeat(100);

/**
 * Returns a best-effort equal-length substitution for "match" based on
 * "template".
 *
 * If `template` is longer than `match`, the full `template` is returned.
 */
function getPaddedReplacement(match, template) {
	if (template.length > match.length) {
		// Truncating may produce an invalid identifier, so we don't risk it.
		return template;
	}

	return (template + PADDING).slice(0, match.length);
}

module.exports = getPaddedReplacement;
