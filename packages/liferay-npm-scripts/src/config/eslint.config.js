/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

module.exports = {
	env: {
		browser: true,
		es6: true
	},
	extends: [require.resolve('eslint-config-liferay')],
	globals: {
		Liferay: true
	},
	overrides: [
		{
			files: ['**/test/**/*.js'],
			env: {
				jest: true
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
