/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const version = process.argv[3];

let FIXTURE;

module.exports = {
	files: [
		'packages/*/package.json',
		'packages/liferay-theme-tasks/lib/**/*',
		(FIXTURE =
			'packages/liferay-theme-tasks/test/fixtures/themes/7.2/base-theme-7-2/package.json'),
	],
	from: [
		/"liferay-theme-tasks": ".*"/g,
		/'liferay-theme-tasks': '.*'/g,
		/"version": ".*"/,
	],
	to: [
		`"liferay-theme-tasks": "^${version}"`,
		`'liferay-theme-tasks': '^${version}'`,
		(match, ...rest) => {
			const filename = rest[rest.length - 1];

			// Some nasty special-casing for the FIXTURE, which has multiple
			// "version" strings inside it that we don't want to mess with.
			if (filename === FIXTURE) {
				return match;
			}

			return `"version": "${version}"`;
		},
	],
};
