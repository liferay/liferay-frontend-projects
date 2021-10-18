/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

module.exports = {
	env: {
		browser: true,
	},
	rules: {
		'@liferay/no-abbreviations': 'off',
		'@liferay/no-it-should': 'warn',
		'curly': 'warn',
		'default-case': 'warn',
		'no-console': 'warn',
		'no-empty': 'warn',
		'no-prototype-builtins': 'warn',
		'no-return-assign': 'warn',
		'no-undef': 'warn',
		'no-unused-expressions': 'warn',
		'no-unused-vars': 'warn',
		'no-useless-escape': 'warn',
		'notice/notice': [
			'error',
			{
				templateFile: path.join(__dirname, 'copyright.js'),
			},
		],
		'prefer-arrow-callback': 'off',
		'promise/catch-or-return': 'off',
		'sort-keys': 'off',
	},
};
