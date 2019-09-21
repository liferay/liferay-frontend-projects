/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');

const local = require('./utils/local');

const config = {
	env: {
		es6: true,
	},
	extends: ['eslint:recommended', require.resolve('eslint-config-prettier')],
	parserOptions: {
		ecmaVersion: 2017,
		sourceType: 'module',
	},
	plugins: [local('liferay'), 'no-for-of-loops', 'no-only-tests', 'notice'],
	rules: {
		'default-case': 'error',
		'liferay/group-imports': 'error',
		'liferay/no-dynamic-require': 'error',
		'liferay/no-it-should': 'error',
		'liferay/padded-test-blocks': 'error',
		'liferay/sort-imports': 'error',
		'no-console': ['error', {allow: ['warn', 'error']}],
		'no-constant-condition': ['error', {checkLoops: false}],
		'no-control-regex': 'off',
		'no-for-of-loops/no-for-of-loops': 'error',
		'no-only-tests/no-only-tests': 'error',
		'no-return-assign': ['error', 'always'],
		'no-unused-expressions': 'error',
		'no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
		'object-shorthand': 'error',
		'prefer-arrow-callback': ['error', {allowNamedFunctions: true}],
		'prefer-const': 'error',
		'prefer-object-spread': 'error',
		'quote-props': ['error', 'as-needed'],
		radix: 'error',
		'sort-keys': ['error', 'asc', {caseSensitive: true, natural: true}],
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
