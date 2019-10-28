/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

module.exports = {
	env: {
		amd: true,
		browser: true,
	},
	extends: '../.eslintrc.js',
	globals: {
		Loader: true,
	},
	rules: {
		'require-jsdoc': 'off',
	},
};
