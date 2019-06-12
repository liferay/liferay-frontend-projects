/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

module.exports = {
	env: {
		browser: true
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
	root: true
};
