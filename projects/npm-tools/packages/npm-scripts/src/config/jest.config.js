/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const config = {
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
		'.+': path.join(__dirname, '..', 'jest', 'transformBabel.js'),
		/* eslint-enable sort-keys */
	},
	transformIgnorePatterns: ['/node_modules/'],
};

if (process.env.USE_REACT_16 === 'true') {
	config.moduleNameMapper = {

		// Testing dependencies

		'^@testing-library/dom((\\/.*)?)$': '@testing-library/dom-8.11.1$1',
		'^@testing-library/jest-dom((\\/.*)?)$':
			'@testing-library/jest-dom-4.2.4$1',
		'^@testing-library/react((\\/.*)?)$': '@testing-library/react-12.1.2$1',
		'^@testing-library/react-hooks((\\/.*)?)$':
			'@testing-library/react-hooks-3.4.2$1',
		'^@testing-library/user-event((\\/.*)?)$':
			'@testing-library/user-event-4.2.4$1',

		// React Dependencies

		'^react$': 'react-16',
		'^react-dom$': 'react-dom-16',
		'^react-dom/server$': 'react-dom-16/server',
		'^react-dom/test-utils$': 'react-dom-16/test-utils',
	};
}

module.exports = config;
