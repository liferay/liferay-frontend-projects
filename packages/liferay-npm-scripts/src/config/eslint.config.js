/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const CONFIG_FILES = [
	'**/.eslintrc.js',
	'**/.prettierrc.js',
	'**/npmscripts.config.js'
];

module.exports = {
	env: {
		browser: true,
		es6: true
	},
	extends: [require.resolve('eslint-config-liferay/portal')],
	globals: {
		AUI: true,
		CKEDITOR: true,
		Liferay: true,
		submitForm: true,
		svg4everybody: true,
		themeDisplay: true
	},
	overrides: [
		{
			files: CONFIG_FILES,
			env: {
				node: true
			}
		},
		{
			files: ['**/test/**/*.js'],
			env: {
				jest: true,
				node: true
			}
		}
	],
	parser: 'babel-eslint',
	parserOptions: {
		ecmaFeatures: {
			jsx: true
		},
		ecmaVersion: 2018
	},
	root: true
};
