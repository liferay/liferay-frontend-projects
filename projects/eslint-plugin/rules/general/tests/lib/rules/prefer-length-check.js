/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const MultiTester = require('../../../../../scripts/MultiTester');
const rule = require('../../../lib/rules/prefer-length-check');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new MultiTester(parserOptions);

const message = 'prefer using .length instead of .length === 0 or .length > 0';

ruleTester.run('prefer-length-check', rule, {
	invalid: [
		{
			code: `if (foo.length === 0) {}`,
			errors: [
				{
					message,
					type: 'BinaryExpression',
				},
			],
			output: `if (!foo.length) {}`,
		},
		{
			code: `if (foo.length > 0) {}`,
			errors: [
				{
					message,
					type: 'BinaryExpression',
				},
			],
			output: `if (!!foo.length) {}`,
		},
	],
	valid: [
		{
			code: `if (foo.length) {}`,
		},
		{
			code: `if (!foo.length) {}`,
		},
		{
			code: `if (!!foo.length) {}`,
		},
	],
});
