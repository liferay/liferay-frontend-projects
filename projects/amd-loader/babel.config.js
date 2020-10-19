/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

module.exports = {
	overrides: [
		{
			presets: [
				[
					'@babel/env',
					{
						targets: {
							node: '10.15',
						},
					},
				],
			],
			test: '**/test/**/*.js',
		},
	],
	presets: ['@babel/env'],
};
