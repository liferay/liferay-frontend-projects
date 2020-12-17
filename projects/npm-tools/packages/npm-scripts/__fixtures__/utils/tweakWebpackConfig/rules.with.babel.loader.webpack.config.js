/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

module.exports = {
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				use: 'babel-loader',
			},
			{
				test: /\.(js|jsx)$/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							include: 'bruno',
						},
					},
				],
			},
		],
	},
};
