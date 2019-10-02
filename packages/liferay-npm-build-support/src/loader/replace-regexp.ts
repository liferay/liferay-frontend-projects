/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	BundlerLoaderContext,
	BundlerLoaderReturn,
} from 'liferay-npm-build-tools-common/lib/api/loaders';

export default function(
	{content, log}: BundlerLoaderContext,
	{
		pattern,
		flags = 'g',
		replacement,
	}: {pattern: string; flags: string; replacement: string}
): BundlerLoaderReturn {
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
