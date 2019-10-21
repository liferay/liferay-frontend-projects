/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');

const rule = require('../../../lib/rules/sort-class-names');

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

const message = 'classes in className attribute must be sorted';

ruleTester.run('sort-class-names', rule, {
	invalid: [
		{
			// Double quotes.
			code: '<div className="a c b d"></div>',
			errors: [
				{
					message,
					type: 'Literal',
				},
			],
			output: '<div className="a b c d"></div>',
		},
		{
			// Single quotes.
			code: "<div className='a c b d'></div>",
			errors: [
				{
					message,
					type: 'Literal',
				},
			],
			output: "<div className='a b c d'></div>",
		},
		{
			// Double quotes inside an expression container.
			code: '<div className={"a c b d"}></div>',
			errors: [
				{
					message,
					type: 'Literal',
				},
			],
			output: '<div className={"a b c d"}></div>',
		},
		{
			// Single quotes inside an expression container.
			code: "<div className={'a c b d'}></div>",
			errors: [
				{
					message,
					type: 'Literal',
				},
			],
			output: "<div className={'a b c d'}></div>",
		},
		{
			// Template literal inside an expression container.
			code: '<div className={`a c b d`}></div>',
			errors: [
				{
					message,
					type: 'TemplateLiteral',
				},
			],
			output: '<div className={`a b c d`}></div>',
		},
		{
			// Internal whitespace damage.
			code: '<div className=" a    b\tc  "></div>',
			errors: [
				{
					message,
					type: 'Literal',
				},
			],
			output: '<div className=" a b c  "></div>',
		},
	],

	valid: [
		{code: '<div className="a b c d"></div>'},
		{code: "<div className='a b c d'></div>"},
		{code: '<div className={"a b c d"}></div>'},
		{code: "<div className={'a b c d'}></div>"},
		{code: '<div className={`a b c d`}></div>'},

		// Note that we don't check template literals containing expressions.
		{code: '<div className={`a c ${b} d`}></div>'},
	],
});
