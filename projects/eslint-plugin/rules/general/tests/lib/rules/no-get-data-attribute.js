/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const MultiTester = require('../../../../../scripts/MultiTester');
const rule = require('../../../lib/rules/no-get-data-attribute');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new MultiTester(parserOptions);

ruleTester.run('no-get-data-attribute', rule, {
	invalid: [
		{
			code: `
				el.querySelector('test').getAttribute('data-foo');
				el.getAttribute('data-test');
			`,
			errors: [
				{
					message:
						'Use "dataset.foo" instead of "getAttribute(\'data-foo\')"',
					type: 'Identifier',
				},
				{
					message: `Use "dataset.test" instead of "getAttribute('data-test')"`,
					type: 'Identifier',
				},
			],
			output: `
				el.querySelector('test').getAttribute('data-foo');
				el.dataset.test;
			`,
		},
	],

	valid: [
		{
			code: `
				el.dataset.test;
				el.dataset.fooBar;
			 `,
		},
	],
});
