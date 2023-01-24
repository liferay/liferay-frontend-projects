/**
 * SPDX-FileCopyrightText: © 2023 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const CONFIG_FILES = [
	'**/.babelrc.js',
	'**/.eslintrc.js',
	'**/.prettierrc.js',
	'**/.stylelintrc.js',
	'**/gulpfile.js',
	'**/liferay-npm-bundler.config.js',
	'**/npmscripts.config.js',
	'**/webpack.config.dev.js',
	'**/webpack.config.js',
];

module.exports = {
	env: {
		browser: true,
		es6: true,
	},
	extends: ['plugin:@liferay/portal'],
	globals: {
		AUI: true,
		CKEDITOR: true,
		Liferay: true,
		process: true,
		submitForm: true,
		svg4everybody: true,
		themeDisplay: true,
	},
	overrides: [
		{
			env: {
				node: true,
			},
			files: CONFIG_FILES,
		},
		{
			env: {
				jest: true,
				node: true,
			},
			files: ['**/test/**/*.{js,ts}'],
		},
	],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2018,
	},
	plugins: ['@liferay'],
	root: true,
};
