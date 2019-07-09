/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const config = {
	extends: [require.resolve('./index')],
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
		'react/jsx-uses-vars': 'error',
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
};

module.exports = config;
