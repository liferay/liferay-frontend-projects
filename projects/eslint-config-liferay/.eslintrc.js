/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

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
	rules: {
		'no-for-of-loops/no-for-of-loops': 'off',
		'notice/notice': [
			'error',
			{
				templateFile: path.join(__dirname, 'copyright.js'),
			},
		],
	},
};
