/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const path = require('path');

module.exports = {
	modulePathIgnorePatterns: ['build/.*', '.*/__fixtures__/.*'],
	testMatch: ['<rootDir>/test/**/*.js'],
	testPathIgnorePatterns: [
		'.eslintrc.js',
		'/__fixtures__/',
		'/node_modules/',
	],
	testURL: 'http://localhost/',
	transform: {
		'\\.js$': path.join(__dirname, 'support/jest.transform.js'),
	},
};
