/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const path = require('path');

module.exports = {
	env: {
		node: true,
	},
	extends: ['plugin:@liferay/general'],
	ignorePatterns: [
		// Generated TypeScript output, plus the copyright template (which is
		// intentionally header-less). Config files are real source and linted.

		'**/*.d.ts',
		'**/*.js',
		'!.eslintrc.js',
		'!.prettierrc.js',

		'node_modules',
	],
	plugins: ['@liferay'],
	root: true,
	rules: {
		'notice/notice': [
			'error',
			{
				templateFile: path.join(__dirname, 'copyright.js'),
			},
		],
	},
};
