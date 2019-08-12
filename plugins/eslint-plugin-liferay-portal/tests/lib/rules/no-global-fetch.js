/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');
const rule = require('../../../lib/rules/no-global-fetch');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new RuleTester(parserOptions);

ruleTester.run('no-global-fetch', rule, {
	invalid: [
		{
			// As a global fetch without an import.
			code: `
				function doSomething(url) {
					return fetch(url);
				};
			`,
			errors: [
				{
					messageId: 'noGlobalFetch',
					type: 'CallExpression',
				},
			],
		},
	],

	valid: [
		{
			// Imported from frontend-js-web
			code: `
				import {fetch} from 'frontend-js-web';

				function doSomething(url) {
					return fetch(url);
				}
			`,
		},
		{
			// Namespaced from Liferay.Util
			code: `
				function doSomething(url) {
					return Liferay.Util.fetch(url);
				}
			`,
		},
	],
});
