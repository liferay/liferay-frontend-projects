/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');

const rule = require('../../../lib/rules/no-duplicate-class-names');

const parserOptions = {
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new RuleTester(parserOptions);

const message = 'classes in className attribute must be unique';

ruleTester.run('no-duplicate-class-names', rule, {
	invalid: [
		{
			code: '<div className="one one two"></div>',
			errors: [
				{
					message,
					type: 'Literal',
				},
			],
			output: '<div className="one two"></div>',
		},
		{
			code: '<div className="one two one"></div>',
			errors: [
				{
					message,
					type: 'Literal',
				},
			],
			output: '<div className="one two"></div>',
		},
	],

	valid: [
		{code: '<div className="one two"></div>'},

		// Note that we don't check template literals containing expressions.
		{code: '<div className={`one one ${two}`}></div>'},
	],
});
