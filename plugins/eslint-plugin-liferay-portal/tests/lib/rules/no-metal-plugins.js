/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');

const rule = require('../../../lib/rules/no-metal-plugins');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new RuleTester(parserOptions);

ruleTester.run('no-metal-plugins', rule, {
	invalid: [
		{
			code: "import Ajax from 'metal-ajax';",
			errors: [
				{
					messageId: 'no-metal-ajax',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import {AOP} from 'metal-aop';",
			errors: [
				{
					messageId: 'no-metal-aop',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import Clipboard from 'metal-clipboard';",
			errors: [
				{
					messageId: 'no-metal-clipboard',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import {debounce} from 'metal-debounce';",
			errors: [
				{
					messageId: 'no-metal-debounce',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import KeyboardFocusManager from 'metal-keyboard-focus';",
			errors: [
				{
					messageId: 'no-metal-keyboard-focus',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import {CancellablePromise} from 'metal-promise';",
			errors: [
				{
					messageId: 'no-metal-promise',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code:
				"import {LocalStorageMechanism, Storage} from 'metal-storage';",
			errors: [
				{
					messageId: 'no-metal-storage',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import {MultiMap} from 'metal-structs';",
			errors: [
				{
					messageId: 'no-metal-structs',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import URI from 'metal-uri';",
			errors: [
				{
					messageId: 'no-metal-uri',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import UA from 'metal-useragent';",
			errors: [
				{
					messageId: 'no-metal-useragent',
					type: 'ImportDeclaration',
				},
			],
		},
	],

	valid: [],
});
