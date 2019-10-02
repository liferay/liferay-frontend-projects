/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	BundleLoaderReturn,
	BundleLoaderContext,
} from 'liferay-npm-build-tools-common/lib/project/types.d';

export default function(
	{content, log}: BundleLoaderContext,
	{
		pattern,
		flags = 'g',
		replacement,
	}: {pattern: string; flags: string; replacement: string}
): BundleLoaderReturn {
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
