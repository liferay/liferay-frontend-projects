/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

module.exports = function getBasePackageJson(platformName) {
	return {
		bin: {
			liferay: './liferay.js',
		},
		dependencies: {
			'@liferay/portal-base': '^1.0.0',
			'liferay-npm-bundler': '*',
		},
		description: 'Target Platform for liferay-' + platformName,
		main: 'config.json',
		name: '@liferay/' + platformName,
		scripts: {
			'build': 'true',
			'ci': 'cd ../.. && yarn ci',
			'format': 'cd ../.. && yarn format',
			'format:check': 'cd ../.. && yarn format:check',
			'lint': 'cd ../.. && yarn lint',
			'lint:fix': 'cd ../.. && yarn lint:fix',
			'postversion': 'npx liferay-js-publish',
			'preversion': 'yarn ci',
			'test': 'cd ../.. && yarn test',
		},
		version: '1.0.0',
	};
};
