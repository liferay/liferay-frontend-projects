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
		$: true,
		AUI: true,
		CKEDITOR: true,
		Liferay: true,
		_: true,
		alert: true,
		confirm: true,
		submitForm: true,
		themeDisplay: true,
		tinyMCE: true,
	},
	rules: {},
};
