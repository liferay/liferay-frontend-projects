/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const MultiTester = require('../../../../../scripts/MultiTester');
const rule = require('../../../lib/rules/no-duplicate-imports');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new MultiTester(parserOptions);

ruleTester.run('no-duplicate-imports', rule, {
	invalid: [
		{
			code: `
				import {g, z} from 'one';
				import x from './x';
				import {a} from 'one';
			`,
			errors: [
				{
					message:
						'modules must be imported only once ' +
						'(duplicate import: "one")',
					type: 'ImportDeclaration',
				},
			],
		},
	],

	valid: [
		{
			code: `
				import {a, g, z} from 'one';
				import x from './x';
			`,
		},
	],
});
