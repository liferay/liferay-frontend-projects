/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const MultiTester = require('../../../../../scripts/MultiTester');
const rule = require('../../../lib/rules/use-state-naming-pattern');

const parserOptions = {
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 6,
		sourceType: 'module',
	},
};

const ruleTester = new MultiTester(parserOptions);

const message = 'useState must follow naming pattern `const [* , set*] =`';

ruleTester.run('use-state-naming-pattern', rule, {
	invalid: [
		{
			code: 'const [val, updateVal] = useState()',
			errors: [
				{
					message,
					type: 'ArrayPattern',
				},
			],
			output: 'const [val, setVal] = useState()',
		},
		{
			code: 'const [val, updateVal] = React.useState()',
			errors: [
				{
					message,
					type: 'ArrayPattern',
				},
			],
			output: 'const [val, setVal] = React.useState()',
		},
	],

	valid: [
		{
			code: 'const [val, setVal] = useState()',
		},
		{
			code: 'const [val, setVal] = useState(1)',
		},
		{
			code: 'const [val, setVal] = React.useState()',
		},
		{
			code: 'const [val, setVal] = React.useState(1)',
		},
	],
});
