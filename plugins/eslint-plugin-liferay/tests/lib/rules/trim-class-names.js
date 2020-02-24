/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');

const rule = require('../../../lib/rules/trim-class-names');

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

const message = 'classes in className attribute must be trimmed';

ruleTester.run('trim-class-names', rule, {
	invalid: [
		{
			// Leading whitespace.
			code: '<div className="   foo bar"></div>',
			errors: [
				{
					message,
					type: 'Literal',
				},
			],
			output: '<div className="foo bar"></div>',
		},
		{
			// Trailing whitespace.
			code: '<div className="foo bar    "></div>',
			errors: [
				{
					message,
					type: 'Literal',
				},
			],
			output: '<div className="foo bar"></div>',
		},
		{
			// Leading and trailing whitespace.
			code: '<div className="  foo bar  "></div>',
			errors: [
				{
					message,
					type: 'Literal',
				},
			],
			output: '<div className="foo bar"></div>',
		},
		{
			// Template literal, with expressions.
			code: `
				<div className={\`
					foo \${bar} baz
				\`}></div>
			`,
			errors: [
				{
					message,
					type: 'TemplateLiteral',
				},
			],
			output: `
				<div className={\`foo \${bar} baz\`}></div>
			`,
		},
	],

	valid: [
		{code: '<div className="foo bar"></div>'},
		{code: "<div className='foo bar'></div>"},
		{code: '<div className={"foo bar"}></div>'},
		{code: "<div className={'foo bar'}></div>"},
		{code: '<div className={`foo bar`}></div>'},
		{code: '<div className={`foo ${bar} baz`}></div>'},
	],
});
