/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const MultiTester = require('../../../../../scripts/MultiTester');
const rule = require('../../../lib/rules/ref-name-suffix');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new MultiTester(parserOptions);

const message = 'useRef values should be suffixed with `Ref`';

const errors = [
	{
		message,
		type: 'Literal',
	},
];

ruleTester.run('ref-name-suffix', rule, {
	invalid: [
		{
			code: `
				const node = useRef(null);
			 `,
			errors,
			output: `
				const nodeRef = useRef(null);
			 `,
		},
		{
			code: `
				const node = React.useRef(null);
			 `,
			errors,
			output: `
				const nodeRef = React.useRef(null);
			 `,
		},
	],

	valid: [
		{
			code: 'const nodeRef = useRef(null);',
		},
		{
			code: 'const nodeRef = React.useRef(null);',
		},
	],
});
