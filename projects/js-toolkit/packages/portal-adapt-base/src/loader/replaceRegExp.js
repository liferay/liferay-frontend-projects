/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/**
 * A loader that replaces regular expressions inside a file.
 *
 * Valid oprtions are:
 *
 *	-pattern: RegExp pattern to look for
 *	-flags: optional RegExp flags to use
 *	-replacement: replacement string
 */
module.exports = function replaceRegexp(context, options) {
	const {content, log} = context;
	const {flags = 'g', pattern, replacement} = options;

	const regexp = new RegExp(pattern, flags);

	const matches = regexp.exec(content);

	if (!matches) {
		log.info(
			'replace-regexp',
			`No occurences of ${pattern} found; nothing to be done`
		);

		return content;
	}

	log.info(
		'replace-regexp',
		`Replaced ${matches.length} occurences of ${pattern}`
	);

	return content.replace(regexp, replacement);
};
