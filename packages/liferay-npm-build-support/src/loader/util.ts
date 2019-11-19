/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import project from 'liferay-npm-build-tools-common/lib/project';

// TODO: get rid of this function once we support loading config from .js files
/**
 * Replace `${project.name}` and `${project.version}` tokens inside strings of
 * loader options objects.
 */
export function replaceTokens<T>(
	options: T,
	{except}: {except: string[]} = {except: []}
): T {
	const {pkgJson} = project;

	Object.keys(options).forEach(key => {
		if (typeof options[key] === 'string') {
			if (except.includes(key)) {
				return;
			}

			options[key] = options[key]
				.replace(/\$\{project\.name\}/g, pkgJson['name'])
				.replace(/\$\{project\.version\}/g, pkgJson['version']);
		}
	});

	return options;
}
