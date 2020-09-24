/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

module.exports = {
	env: {
		browser: true,
		jest: true,
		node: true,
	},
	extends: '@liferay',
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
