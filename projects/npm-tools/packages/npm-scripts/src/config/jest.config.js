/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

module.exports = {
	coverageDirectory: 'build/coverage',
	modulePathIgnorePatterns: ['/__fixtures__/', '/build/', '/classes/'],
	resolver: require.resolve('../jest/resolver.js'),
	setupFiles: [require.resolve('../jest/setup.js')],
	setupFilesAfterEnv: [require.resolve('../jest/setupAfterEnv.js')],
	testEnvironment: 'jest-environment-jsdom-thirteen',
	testMatch: ['<rootDir>/test/**/*.{js,ts,tsx}'],
	testPathIgnorePatterns: ['/node_modules/', '<rootDir>/test/stories/'],
	testResultsProcessor: '@liferay/jest-junit-reporter',
	testURL: 'http://localhost',
	transform: {
		/* eslint-disable sort-keys */
		'\\.scss$': path.join(__dirname, '..', 'jest', 'transformSass.js'),
		'\\.soy$': path.join(__dirname, '..', 'jest', 'transformSoy.js'),
		'.+': path.join(__dirname, '..', 'jest', 'transformBabel.js'),
		/* eslint-enable sort-keys */
	},
	transformIgnorePatterns: ['/node_modules/', '<rootDir>/.*\\.soy$'],
};
