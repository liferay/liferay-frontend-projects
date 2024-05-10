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
	extends: ['plugin:@liferay/general'],
	ignorePatterns: [

		// Project-specific

		'/maintenance/projects/js-toolkit/qa',
		'/maintenance/projects/js-toolkit/**/generators',
		'/maintenance/projects/js-toolkit/**/lib',
		'/maintenance/projects/js-toolkit/**/__fixtures__',
		'/maintenance/projects/senna/build',
		'/maintenance/projects/amd-loader/build',
		'/maintenance/projects/amd-loader/src/demo/modules',
		'/projects/js-themes-toolkit/packages/liferay-theme-tasks/lib/r2',
		'/projects/js-themes-toolkit/qa',
		'/projects/js-toolkit/packages/js-api/**/*.d.ts',
		'/projects/js-toolkit/packages/js-api/**/*.js',
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
	plugins: ['@liferay'],
	rules: {
		'@liferay/import-extensions': 'off',
		'notice/notice': [
			'error',
			{
				templateFile: path.join(__dirname, 'copyright.js'),
			},
		],
	},
};
