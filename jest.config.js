/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

module.exports = {
	projects: [
		// Projects which require special configuration.

		'projects/eslint-config/jest.config.js',
		'projects/npm-tools/packages/npm-scripts/jest.config.js',

		// Everything else.
		//
		// Note the trickiness here: the next project is "recursive";
		// when Jest looks at it, it will use the `testMatch` (etc)
		// below and ignore the `projects` listing.

		'jest.config.js',
	],
	testMatch: ['**/test/**/*.js'],

	// Any project which had special configuration above should be ignored here.

	testPathIgnorePatterns: [
		'<rootDir>/projects/eslint-config',
		'<rootDir>/projects/npm-tools/packages/npm-scripts',
	],
};
