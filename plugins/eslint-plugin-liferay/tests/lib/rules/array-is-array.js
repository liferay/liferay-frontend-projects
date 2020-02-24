/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');

const rule = require('../../../lib/rules/array-is-array');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
	},
};

const ruleTester = new RuleTester(parserOptions);

ruleTester.run('array-is-array', rule, {
	invalid: [
		{
			code: 'const a = input instanceof Array ? input : [input];',
			errors: [
				{
					message: 'use Array.isArray()',
					type: 'BinaryExpression',
				},
			],
			output: 'const a = Array.isArray(input) ? input : [input];',
		},
		{
			code: `
				const isArray = getThing(
					foo,
					bar
				) instanceof Array;
			`,
			errors: [
				{
					message: 'use Array.isArray()',
					type: 'BinaryExpression',
				},
			],
			output: `
				const isArray = Array.isArray(getThing(
					foo,
					bar
				));
			`,
		},
	],
	valid: [
		{
			code: 'const a = Array.isArray(input) ? input : [input];',
		},
	],
});
