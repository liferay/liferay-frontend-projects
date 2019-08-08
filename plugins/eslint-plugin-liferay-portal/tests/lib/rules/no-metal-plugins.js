/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
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
	valid: [],
	invalid: [
		{
			code: "import Ajax from 'metal-ajax';",
			errors: [
				{
					messageId: 'noMetalAjax',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import {AOP} from 'metal-aop';",
			errors: [
				{
					messageId: 'noMetalAop',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import Clipboard from 'metal-clipboard';",
			errors: [
				{
					messageId: 'noMetalClipboard',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import {debounce} from 'metal-debounce';",
			errors: [
				{
					messageId: 'noMetalDebounce',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import KeyboardFocusManager from 'metal-keyboard-focus';",
			errors: [
				{
					messageId: 'noMetalKeyboardFocus',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import {CancellablePromise} from 'metal-promise';",
			errors: [
				{
					messageId: 'noMetalPromise',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code:
				"import {LocalStorageMechanism, Storage} from 'metal-storage';",
			errors: [
				{
					messageId: 'noMetalStorage',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import {MultiMap} from 'metal-structs';",
			errors: [
				{
					messageId: 'noMetalStructs',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import URI from 'metal-uri';",
			errors: [
				{
					messageId: 'noMetalUri',
					type: 'ImportDeclaration',
				},
			],
		},
		{
			code: "import UA from 'metal-useragent';",
			errors: [
				{
					messageId: 'noMetalUseragent',
					type: 'ImportDeclaration',
				},
			],
		},
	],
});
