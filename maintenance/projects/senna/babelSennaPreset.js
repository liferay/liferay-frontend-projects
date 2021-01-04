/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {version} = require('./package.json');

module.exports = () => ({
	presets: [require('babel-preset-metal')],
	plugins: [
		[
			require('babel-plugin-search-and-replace'),
			[
				{
					search: '<%= version %>',
					replace: version,
				},
			],
		],
		require('babel-plugin-transform-remove-console'),
	],
});
