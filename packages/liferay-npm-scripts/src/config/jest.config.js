/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

module.exports = {
	globals: {
		Liferay: {}
	},
	coverageDirectory: 'build/coverage',
	modulePathIgnorePatterns: ['/__fixtures__/', '/build/', '/classes/'],
	testMatch: ['**/test/**/*.js'],
	testPathIgnorePatterns: ['/node_modules/', '<rootDir>/test/stories/'],
	testResultsProcessor: 'liferay-jest-junit-reporter',
	testURL: 'http://localhost',
	transform: {
		'\\.soy$': path.join(__dirname, '..', 'jest', 'transformSoy.js'),
		'.+': path.join(__dirname, '..', 'jest', 'transformBabel.js')
	}
};
