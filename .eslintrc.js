/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

module.exports = {
	env: {
		jest: true,
		node: true,
	},
	extends: 'liferay',
	parserOptions: {
		ecmaVersion: 2018,
	},
	rules: {
		'notice/notice': [
			'error',
			{
				templateFile: path.join(__dirname, 'copyright.js'),
			},
		],
	},
};
