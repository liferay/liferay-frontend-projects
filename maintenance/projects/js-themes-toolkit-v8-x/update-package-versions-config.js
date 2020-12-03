/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const version = process.argv[3];

module.exports = {
	files: [
		'packages/generator-liferay-theme/generators/**/*',
		'packages/generator-liferay-theme/lib/!(__tests__)/**/*',
		'packages/liferay-theme-tasks/lib/!(__tests__)/**/*',
	],
	from: [
		/"liferay-theme-deps-7.(\d)": ".*"/g,
		/"liferay-theme-tasks": ".*"/g,
		/'liferay-theme-deps-7.(\d)': '.*'/g,
		/'liferay-theme-tasks': '.*'/g,
		/dependencies\['liferay-theme-deps-7.0'\] = '.*';/,
		/dependencies\['liferay-theme-deps-7.1'\] = '.*';/,
	],
	to: [
		`"liferay-theme-deps-7.$1": "${version}"`,
		`"liferay-theme-tasks": "${version}"`,
		`'liferay-theme-deps-7.$1': '${version}'`,
		`'liferay-theme-tasks': '${version}'`,
		`dependencies['liferay-theme-deps-7.0'] = '${version}';`,
		`dependencies['liferay-theme-deps-7.1'] = '${version}';`,
	],
};
