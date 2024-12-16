/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import type {Project} from 'liferay-npm-build-tools-common/lib/project';

/**
 * Replace `${project.dir.basename}`, `${project.name}` and `${project.version}`
 * tokens inside strings of loader options objects.
 */
export default function replaceTokens<T>(
	project: Project,
	options: T,
	{except} = {except: []}
): T {
	const {pkgJson} = project;

	Object.keys(options).forEach((key) => {
		if (typeof options[key] === 'string') {
			if (except.includes(key)) {
				return;
			}

			options[key] = options[key]
				.replace(
					/\$\{project\.dir\.basename\}/g,
					project.dir.basename().toString()
				)
				.replace(/\$\{project\.name\}/g, pkgJson['name'])
				.replace(/\$\{project\.version\}/g, pkgJson['version']);
		}
	});

	return options;
}
