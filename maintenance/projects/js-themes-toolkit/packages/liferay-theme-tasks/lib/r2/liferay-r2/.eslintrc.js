/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

module.exports = {
	overrides: [
		{

			// These files originally from: https://github.com/ded/R2
			// Via fork: https://github.com/liferay-labs/R2

			files: ['index.js', '__tests__/index.test.js'],
			rules: {
				'notice/notice': [
					'error',
					{
						templateFile: path.join(__dirname, 'copyright.js'),
					},
				],
			},
		},
	],
};
