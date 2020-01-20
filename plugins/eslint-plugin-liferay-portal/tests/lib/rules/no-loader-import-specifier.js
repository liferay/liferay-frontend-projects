/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');

const rule = require('../../../lib/rules/no-loader-import-specifier');

const parserOptions = {
	ecmaVersion: 6,
	sourceType: 'module',
};

const ruleTester = new RuleTester({parserOptions});

const errors = [
	{
		messageId: 'noLoaderImportSpecifiers',
		type: 'ImportDeclaration',
	},
];

ruleTester.run('no-loader-import-specifier', rule, {
	invalid: [
		{
			code: "import styles from './styles.scss';",
			errors,
		},
		{
			code: "import * as styles from './styles.scss';",
			errors,
		},
		{
			code: "import {something} from './styles.scss';",
			errors,
		},
		{
			code: "import {something as thing} from './styles.scss';",
			errors,
		},
		{
			code: "import styles, {something} from './styles.scss';",
			errors,
		},
	],

	valid: [
		{
			code: "import './styles.scss';",
		},
	],
});
