/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	BundlerLoaderContext,
	BundlerLoaderReturn,
} from 'liferay-npm-build-tools-common/lib/api/loaders';

/** Configuration options for `replace-regexp` loader */
export interface Options {

	/** RegExp flags to use */
	flags?: string;

	/** RegExp pattern to look for */
	pattern: string;

	/** Replacement string */
	replacement: string;
}

/**
 * A loader that replaces regular expressions inside a file.
 *
 * @deprecated Use the loader from @liferay/portal-adapt-base instead
 */
export default function (
	context: BundlerLoaderContext,
	options: Options
): BundlerLoaderReturn {
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
}
