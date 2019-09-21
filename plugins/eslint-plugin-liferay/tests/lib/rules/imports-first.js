/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');

const rule = require('../../../lib/rules/imports-first');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new RuleTester(parserOptions);

ruleTester.run('imports-first', rule, {
	invalid: [
		{
			code: `
				const ok = require('ok');

				const NAME = 'thing';

				import x from './x';

				require('thing');

				const final = require('./final');
			`,
			errors: [
				{
					message: 'imports must come before other statements',
					type: 'ImportDeclaration',
				},
				{
					message: 'imports must come before other statements',
					type: 'ExpressionStatement',
				},
				{
					message: 'imports must come before other statements',
					type: 'VariableDeclaration',
				},
			],
		},
	],

	valid: [
		{
			code: `
				const z = require('z');

				import x from './x';

				const NAME = 'thing';

				function init() {
					// This require() is fine, because
					// it is not at the top-level.
					require('other')();
				}
			`,
		},
	],
});
