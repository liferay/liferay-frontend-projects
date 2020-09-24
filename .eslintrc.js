/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

module.exports = {
	env: {
		// Available environments: https://eslint.org/docs/user-guide/configuring#specifying-environments

		node: true,
	},
	extends: '@liferay',
	overrides: [
		{
			env: {
				jest: true,
			},
			files: ['**/test/**/*.js', '**/tests/**/*.js'],
		},
	],
	rules: {
		'no-for-of-loops/no-for-of-loops': 'off',
		'notice/notice': [
			'error',
			{
				templateFile: path.join(__dirname, 'copyright.js'),
			},
		],
	},
};
