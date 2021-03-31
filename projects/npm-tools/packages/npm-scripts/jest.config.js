/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

module.exports = {
	modulePathIgnorePatterns: ['<rootDir>/__fixtures__'],
	setupFilesAfterEnv: ['<rootDir>/support/jest/matchers.js'],
	testEnvironment: 'node',
	testMatch: ['**/test/**/*.js'],
};
