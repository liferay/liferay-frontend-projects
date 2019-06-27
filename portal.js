/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const local = require('./utils/local');

const config = {
	extends: [require.resolve('./index')],
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
	},
	plugins: [local('liferay-portal')],
	rules: {
		'liferay-portal/no-side-navigation': 'error',
	},
};

module.exports = config;
