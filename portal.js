/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

const fs = require('fs');
const path = require('path');
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
		'liferay-portal/no-explicit-extend': 'error',
		'liferay-portal/no-global-fetch': 'error',
		'liferay-portal/no-metal-plugins': 'error',
		'liferay-portal/no-side-navigation': 'error',
	},
};

/**
 * The standard configuration (in "./index") only looks for a template
 * in the current working directory; here we make things work when run from a
 * project directory of the form "modules/apps/foo/bar" in the liferay-portal
 * repo.
 */
if (
	path.basename(process.cwd()) !== 'modules' &&
	path.basename(path.resolve('../../..')) === 'modules' &&
	fs.existsSync('../../../copyright.js')
) {
	config.rules['notice/notice'] = [
		'error',
		{
			templateFile: '../../../copyright.js',
		},
	];
}

module.exports = config;
