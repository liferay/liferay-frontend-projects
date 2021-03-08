/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const path = require('path');

// Rules copied from 'plugin:@typescript-eslint/recommended' (v2.21.0)

const typescriptEslintRecommendedRules = {
	'@typescript-eslint/adjacent-overload-signatures': 'error',
	'@typescript-eslint/ban-ts-comment': 'error',

	// Temporarily setting ban-types to "off':
	// https://github.com/liferay/liferay-frontend-projects/issues/127

	'@typescript-eslint/ban-types': 'off',
	'@typescript-eslint/consistent-type-assertions': 'error',
	'@typescript-eslint/explicit-function-return-type': 'warn',
	'@typescript-eslint/member-delimiter-style': 'error',
	'@typescript-eslint/naming-convention': [
		'error',
		{
			format: ['camelCase', 'UPPER_CASE'],
			leadingUnderscore: 'allow',
			selector: 'variableLike',
		},
	],
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

	// Temporarily turn off lines-around-comment:
	// https://github.com/liferay/liferay-frontend-projects/issues/128

	'lines-around-comment': 'off',
	'no-array-constructor': 'off',
	'no-empty-function': 'off',
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
	'no-this-before-super': 'off',
	'no-unreachable': 'off',
	'valid-typeof': 'off',
};

module.exports = {
	env: {
		jest: true,
		node: true,
	},
	overrides: [
		{
			files: ['*.ts'],
			parserOptions: {
				project: path.join(__dirname, 'tsconfig.json'),
			},
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
	rules: {
		'no-return-assign': ['error', 'except-parens'],
		'notice/notice': [
			'error',
			{
				templateFile: path.join(__dirname, 'copyright.js'),
			},
		],
	},
};
