/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

module.exports = {
	modulePathIgnorePatterns: [
		'packages/generator-liferay-theme/generators/layout/',
	],
	setupFilesAfterEnv: ['<rootDir>/jest.js'],
	testPathIgnorePatterns: [
		'/__fixtures__/',
		'/__snapshots__/',
		'/fixtures/',
		'/node_modules/',
	],
	testRegex: ['.*\\.test\\.js', '/__tests__/.*\\.js', '/plugin/test/.*\\.js'],
};
