/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

module.exports = {
	env: {
		// Available environments: https://eslint.org/docs/user-guide/configuring#specifying-environments
		es6: true,
		node: true,
	},
	extends: 'liferay',
	globals: {
		AUI: true,
		CKEDITOR: true,
		Liferay: true,
		alert: true,
		confirm: true,
		submitForm: true,
		themeDisplay: true,
		tinyMCE: true,
	},
	parserOptions: {
		ecmaVersion: 2018,
	},
	rules: {},
};
