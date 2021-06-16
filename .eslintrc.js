/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const path = require('path');

module.exports = {
	env: {

		// Available environments: https://eslint.org/docs/user-guide/configuring#specifying-environments

		node: true,
	},
	extends: '@liferay',
	ignorePatterns: [

		// Project-specific

		'/maintenance/projects/js-toolkit/qa',
		'/maintenance/projects/js-toolkit/**/generators',
		'/maintenance/projects/js-toolkit/**/lib',
		'/maintenance/projects/js-toolkit/**/__fixtures__',
		'/maintenance/projects/senna/build',
		'/projects/amd-loader/build',
		'/projects/js-toolkit/qa',
		'/projects/js-toolkit/**/generators',
		'/projects/js-toolkit/**/lib',
		'/projects/js-toolkit/**/__tests__',

		// Templates

		'/copyright.js',
		'/maintenance/projects/**/copyright.js',
		'/projects/**/copyright.js',
		'/target-platforms/copyright.js',

		// Third-party code

		'/third-party/projects',
		'node_modules',
	],
	overrides: [
		{
			env: {
				jest: true,
			},
			files: [
				'**/__tests__/**/*.js',
				'**/test/**/*.js',
				'**/tests/**/*.js',
			],
		},
	],
	rules: {
		'notice/notice': [
			'error',
			{
				templateFile: path.join(__dirname, 'copyright.js'),
			},
		],
	},
};
