/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');
const rule = require('../../../lib/rules/no-it-should');

const ruleTester = new RuleTester();

ruleTester.run('no-it-should', rule, {
	invalid: [
		{
			code: "it('should do the right thing')",
			errors: [
				{
					message: 'it() strings should not start with "should"',
					type: 'Literal',
				},
			],
		},
	],

	valid: [
		{
			code: 'it("behaves")',
		},
		{
			code: `it('has a checkbox with label "should notify"')`,
		},
	],
});
