/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import project from 'liferay-npm-build-tools-common/lib/project';

// TODO: get rid of this function once we support loading config from .js files
/**
 * Replace `${project.dir.basename}`, `${project.name}` and `${project.version}`
 * tokens inside strings of loader options objects.
 */
export function replaceTokens<T>(
	options: T,
	{except}: {except: string[]} = {except: []}
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

/**
 * Remove a webpack hash (a hex number surrounded by dots near the end of the
 * file name) if present from a file path.
 */
export function removeWebpackHash(filePath: string): string {
	const filePathParts = filePath.split('.');

	let hashIndex;

	for (hashIndex = filePathParts.length - 1; hashIndex >= 0; hashIndex--) {
		const filePathPart = filePathParts[hashIndex];

		if (filePathPart.match(/^[0-9a-fA-F]+$/)) {
			break;
		}
	}

	if (hashIndex === -1) {
		return filePath;
	}

	filePathParts.splice(hashIndex, 1);

	return filePathParts.join('.');
}
