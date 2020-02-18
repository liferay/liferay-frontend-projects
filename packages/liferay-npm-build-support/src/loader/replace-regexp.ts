/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	BundlerLoaderContext,
	BundlerLoaderReturn,
} from 'liferay-npm-build-tools-common/lib/api/loaders';

/** Configuration options for `replace-regexp` loader */
export interface Options {
	/** RegExp pattern to look for */
	pattern: string;

	/** RegExp flags to use */
	flags?: string;

	/** Replacement string */
	replacement: string;
}

/**
 * A loader that replaces regular expressions inside a file.
 */
export default function(
	context: BundlerLoaderContext<string>,
	options: Options
): BundlerLoaderReturn {
	const {content, log} = context;
	const {pattern, flags = 'g', replacement} = options;

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
