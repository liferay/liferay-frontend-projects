/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');

const rule = require('../../../lib/rules/group-imports');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new RuleTester(parserOptions);

ruleTester.run('group-imports', rule, {
	invalid: [
		{
			code: `
				import abc from 'abc';
				import {g, z} from 'one'; // Correct.

				import {a} from 'other'; // 1 excess blank line before.


				import w from 'w'; // 2 excess blank lines before.
				// Comment describing the next import.
				import stuff from 'stuff';
				import 'side-effect';
				import x from './x';
			`,
			errors: [
				{
					message:
						'imports must be grouped ' +
						'(unexpected blank line before: "other")',
					type: 'ImportDeclaration',
				},
				{
					message:
						'imports must be grouped ' +
						'(unexpected blank line before: "w")',
					type: 'ImportDeclaration',
				},
				{
					message:
						'imports must be grouped ' +
						'(expected blank line before: "stuff")',
					type: 'ImportDeclaration',
				},
				{
					message:
						'imports must be grouped ' +
						'(expected blank line before: "side-effect")',
					type: 'ImportDeclaration',
				},
				{
					message:
						'imports must be grouped ' +
						'(expected blank line before: "./x")',
					type: 'ImportDeclaration',
				},
			],
			output: `
				import abc from 'abc';
				import {g, z} from 'one'; // Correct.
				import {a} from 'other'; // 1 excess blank line before.
				import w from 'w'; // 2 excess blank lines before.

				// Comment describing the next import.
				import stuff from 'stuff';

				import 'side-effect';

				import x from './x';
			`,
		},
	],

	valid: [
		{
			code: `
				import {g, z} from 'one';
				import {a} from 'other';

				// Comment describing the next import.
				import stuff from 'stuff';

				import 'side-effect';

				import x from './x';
			`,
		},
	],
});
