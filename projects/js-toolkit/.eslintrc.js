/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const path = require('path');

// Rules copied from 'plugin:@typescript-eslint/recommended' (v2.21.0)

const typescriptEslintRecommendedRules = {
	'@typescript-eslint/adjacent-overload-signatures': 'error',
	'@typescript-eslint/ban-ts-ignore': 'error',
	'@typescript-eslint/ban-types': 'error',
	'@typescript-eslint/camelcase': 'error',
	'@typescript-eslint/class-name-casing': 'error',
	'@typescript-eslint/consistent-type-assertions': 'error',
	'@typescript-eslint/explicit-function-return-type': 'warn',
	'@typescript-eslint/interface-name-prefix': 'error',
	'@typescript-eslint/member-delimiter-style': 'error',
	'@typescript-eslint/no-array-constructor': 'error',
	'@typescript-eslint/no-empty-function': 'error',
	'@typescript-eslint/no-empty-interface': 'error',
	'@typescript-eslint/no-explicit-any': 'warn',
	'@typescript-eslint/no-inferrable-types': 'error',
	'@typescript-eslint/no-misused-new': 'error',
	'@typescript-eslint/no-namespace': 'error',
	'@typescript-eslint/no-non-null-assertion': 'warn',
	'@typescript-eslint/no-this-alias': 'error',
	'@typescript-eslint/no-unused-vars': 'warn',
	'@typescript-eslint/no-use-before-define': 'error',
	'@typescript-eslint/no-var-requires': 'error',
	'@typescript-eslint/prefer-namespace-keyword': 'error',
	'@typescript-eslint/triple-slash-reference': 'error',
	'@typescript-eslint/type-annotation-spacing': 'error',
	camelcase: 'off',
	'no-array-constructor': 'off',
	'no-empty-function': 'off',
	'no-unused-vars': 'off',
	'no-use-before-define': 'off',
	'no-var': 'error',
	'prefer-const': 'error',
	'prefer-rest-params': 'error',
	'prefer-spread': 'error',
};

// Rules copied from 'plugin:@typescript-eslint/eslint-recommended' (v2.21.0)

const typescriptEslintEslintRecommendedRules = {
	'getter-return': 'off',
	'no-const-assign': 'off',
	'no-dupe-args': 'off',
	'no-dupe-class-members': 'off',
	'no-dupe-keys': 'off',
	'no-new-symbol': 'off',
	'no-redeclare': 'off',
	'no-this-before-super': 'off',
	'no-undef': 'off',
	'no-unreachable': 'off',
	'valid-typeof': 'off',
};

module.exports = {
	env: {
		jest: true,
		node: true,
	},
	extends: ['@liferay'],
	overrides: [
		{
			files: ['*.ts'],
			parser: '@typescript-eslint/parser',
			parserOptions: {
				project: path.join(__dirname, 'tsconfig.json'),
			},
			plugins: ['@typescript-eslint'],
			rules: {
				...typescriptEslintRecommendedRules,
				...typescriptEslintEslintRecommendedRules,
				'@typescript-eslint/await-thenable': 'error',
				'@typescript-eslint/no-explicit-any': [
					'error',
					{
						fixToUnknown: true,
					},
				],
				'@typescript-eslint/no-use-before-define': 'off',
				'@typescript-eslint/switch-exhaustiveness-check': 'error',
			},
		},
	],
	root: true,
	rules: {
		'no-for-of-loops/no-for-of-loops': 'off',
		'no-return-assign': ['error', 'except-parens'],
		'notice/notice': [
			'error',
			{
				templateFile: path.join(__dirname, 'copyright.js'),
			},
		],
	},
};
