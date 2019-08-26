/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

module.exports = {
	coverageDirectory: 'build/coverage',
	modulePathIgnorePatterns: ['/__fixtures__/', '/build/', '/classes/'],
	setupFiles: [require.resolve('../jest/setup.js')],
	setupFilesAfterEnv: [require.resolve('../jest/setupAfterEnv.js')],
	testMatch: ['**/test/**/*.js'],
	testPathIgnorePatterns: ['/node_modules/', '<rootDir>/test/stories/'],
	testResultsProcessor: 'liferay-jest-junit-reporter',
	testURL: 'http://localhost',
	transform: {
		/* eslint-disable sort-keys */
		'\\.soy$': path.join(__dirname, '..', 'jest', 'transformSoy.js'),
		'.+': path.join(__dirname, '..', 'jest', 'transformBabel.js')
		/* eslint-enable sort-keys */
	}
};
