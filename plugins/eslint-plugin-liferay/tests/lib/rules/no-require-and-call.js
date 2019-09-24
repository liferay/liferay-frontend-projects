/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');

const rule = require('../../../lib/rules/no-require-and-call');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new RuleTester(parserOptions);

const message =
	'functions returned by require() should be assigned to a variable before calling';

const error = {
	message,
	type: 'CallExpression',
};

ruleTester.run('no-require-and-call', rule, {
	invalid: [
		{
			code: "const stuff = require('foo')();",
			errors: [error],
		},
		{
			code: "const stuff = require('foo')(true);",
			errors: [error],
		},
		{
			code: "require('immediate')();",
			errors: [error],
		},
		{
			code: "require('immediate')(1, 2, 3);",
			errors: [error],
		},
	],
	valid: [
		{
			code: `
				// We only care about what happens at the top level.
				function nested() {
					return require('foo')();
				}
			`,
		},
	],
});
