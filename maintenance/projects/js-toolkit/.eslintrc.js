/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const path = require('path');

module.exports = {
	env: {
		node: true,
		jest: true,
	},
	rules: {
		'@liferay/liferay/no-dynamic-require': 'off',
		'no-console': 'off',
		'no-return-assign': ['error', 'except-parens'],
		'notice/notice': [
			'error',
			{
				templateFile: path.join(__dirname, 'copyright.js'),
			},
		],
		'sort-keys': 'off',
	},
};
