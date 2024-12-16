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

		'/maintenance/projects/js-toolkit-v2-x/qa',
		'/maintenance/projects/js-toolkit-v2-x/**/generators',
		'/maintenance/projects/js-toolkit-v2-x/**/lib',
		'/maintenance/projects/js-toolkit-v2-x/**/__fixtures__',
		'/maintenance/projects/senna/build',
		'/maintenance/projects/amd-loader/build',
		'/maintenance/projects/amd-loader/src/demo/modules',
		'/maintenance/projects/js-themes-toolkit/packages/liferay-theme-tasks/lib/r2',
		'/maintenance/projects/js-themes-toolkit/qa',
		'/maintenance/projects/js-toolkit/packages/js-api/**/*.d.ts',
		'/maintenance/projects/js-toolkit/packages/js-api/**/*.js',
		'/maintenance/projects/js-toolkit/qa',
		'/maintenance/projects/js-toolkit/**/generators',
		'/maintenance/projects/js-toolkit/**/lib',
		'/maintenance/projects/js-toolkit/**/__tests__',
		'/projects/prettier-plugin/dist',
		'/projects/stylelint-plugin/dist',

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
