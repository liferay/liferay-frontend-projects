/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * Prettier will trim empty first and last lines, but we need to keep them
 * around (to preserve the typical linebreak after an opening tag, and the
 * indent before a closing tag, which is often on a line of its own).
 */
function trim(string) {
	let prefix = '';

	let suffix = '';

	const trimmed = string.replace(
		/^\s*(\r\n|\n)|(?:\r?\n)([ \t]*$)/g,
		(match, leadingNewline, trailingHorizontalWhitespace) => {
			if (leadingNewline) {
				prefix = leadingNewline;
			} else if (trailingHorizontalWhitespace) {
				suffix = trailingHorizontalWhitespace;
			}

			return '';
		}
	);

	return {prefix, suffix, trimmed};
}

module.exports = trim;
