/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

module.exports = {
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				use: 'ts-loader',
			},
			{
				test: /\.(js|jsx)$/,
				use: ['ts-loader'],
			},
		],
	},
};
