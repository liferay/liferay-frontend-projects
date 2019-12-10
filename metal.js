/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const config = {
	extends: [require.resolve('./react')],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
	plugins: ['react'],
	rules: {
		/**
		 * @see https://github.com/yannickcr/eslint-plugin-react
		 */
		'react/no-string-refs': 'off',
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
};

module.exports = config;
