/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

module.exports = function getBasePackageJson(
	platformName,
	portalVersion,
	createPlatformConfig
) {
	let version = '0.0.0';

	if (portalVersion.startsWith('fix-pack-base-')) {
		version = '1.0.0';
	}
	else if (portalVersion.startsWith('fix-pack-dxp-')) {
		const parts = portalVersion.split('-');

		version = `${Number(parts[3]) + 1}.0.0`;
	}

	return {
		bin: {
			liferay: './liferay.js',
		},
		dependencies: {
			'@liferay/portal-base': '^1.0.0',
			'liferay-npm-bundler': '*',
			...createPlatformConfig.dependencies
		},
		description: `Target platform for Liferay Portal ${portalVersion}`,
		main: 'config.json',
		name: `@liferay/${platformName}`,
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
		version,
	};
};
