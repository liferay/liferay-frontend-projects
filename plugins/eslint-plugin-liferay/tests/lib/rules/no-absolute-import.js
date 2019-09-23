/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');

const rule = require('../../../lib/rules/no-absolute-import');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new RuleTester(parserOptions);

ruleTester.run('no-absolute-import', rule, {
	invalid: [
		{
			code: `
				const thing = require(\`/etc/thing\`);
				const other = require('/home/me/other');
				import {x} from '/tmp/x';
			`,
			errors: [
				{
					message: 'import sources should not use absolute paths',
					type: 'TemplateLiteral',
				},
				{
					message: 'import sources should not use absolute paths',
					type: 'Literal',
				},
				{
					message: 'import sources should not use absolute paths',
					type: 'Literal',
				},
			],
		},
	],

	valid: [
		{
			code: `
				const thing = require(\`../../etc/thing\`);
				const other = require('other');
				import {x} from 'x';
			`,
		},
	],
});
