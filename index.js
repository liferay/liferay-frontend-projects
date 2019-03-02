/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');

const config = {
	env: {
		es6: true,
	},
	extends: ['eslint:recommended', require.resolve('eslint-config-prettier')],
	parserOptions: {
		ecmaVersion: 2017,
		sourceType: 'module',
	},
	plugins: ['liferayportal', 'no-only-tests', 'notice'],
	rules: {
		'liferayportal/arrowfunction-newline': 0,
		'no-console': 0,
		'no-constant-condition': 0,
		'no-empty': 0,
		'no-only-tests/no-only-tests': 'error',
		'no-unused-vars': [2, {args: 'after-used'}],
		'no-process-env': 0,
		'comma-spacing': 0,
		indent: ['error', 'tab'],
		'keyword-spacing': 1,
		'max-len': [
			2,
			{
				code: 80,
				comments: 120,
				ignoreRegExpLiterals: true,
				ignoreStrings: true,
				ignoreTemplateLiterals: true,
				ignoreUrls: true,
				tabWidth: 4,
			},
		],
		'no-tabs': 0,
		'arrow-parens': 0, // Setting for Prettier
	},
};

if (fs.existsSync('copyright.js')) {
	config.rules['notice/notice'] = [
		'error',
		{
			templateFile: 'copyright.js',
		},
	];
}

module.exports = config;
