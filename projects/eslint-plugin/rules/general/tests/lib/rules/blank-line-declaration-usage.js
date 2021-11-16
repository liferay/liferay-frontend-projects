/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const MultiTester = require('../../../../../scripts/MultiTester');
const rule = require('../../../lib/rules/blank-line-declaration-usage');

const parserOptions = {
	parserOptions: {
		ecmaVersion: 6,
	},
};

const message =
	'Expected an empty line between variable declaration and usage.';

const ruleTester = new MultiTester(parserOptions);

ruleTester.run('blank-line-declaration-usage', rule, {
	invalid: [
		{
			code: `
				const test = 'test';
				const testLength = test.length;
			`,
			errors: [
				{
					message,
					type: 'Identifier',
				},
			],
			output: `
				const test = 'test';

				const testLength = test.length;
			`,
		},
		{
			code: `
				const obj = {
					foo: 'bar',
					bar: 'foo',
					life: 'ray',
				}
				Object.keys(obj)
			`,
			errors: [
				{
					message,
					type: 'Identifier',
				},
			],
			output: `
				const obj = {
					foo: 'bar',
					bar: 'foo',
					life: 'ray',
				}

				Object.keys(obj)
			`,
		},
		{
			code: `
				function updateData() {
					const obj = {
						foo: 'bar',
						bar: 'foo',
						life: 'ray',
					}

					const ids = Object.keys(obj).length
						? 'superLongStringSoThatItForcesTheLineToBeWrapped'
						: 'justASimpleString';
					ids.length;
				}
			`,
			errors: [
				{
					message,
					type: 'Identifier',
				},
			],
			output: `
				function updateData() {
					const obj = {
						foo: 'bar',
						bar: 'foo',
						life: 'ray',
					}

					const ids = Object.keys(obj).length
						? 'superLongStringSoThatItForcesTheLineToBeWrapped'
						: 'justASimpleString';

					ids.length;
				}
			`,
		},
		{
			code: `
				const obj = {
					foo: 'bar',
					bar: 'foo',
					life: 'ray',
				}

				const {foo} = obj;
				const length = foo.length;
			`,
			errors: [
				{
					message,
					type: 'Identifier',
				},
			],
			output: `
				const obj = {
					foo: 'bar',
					bar: 'foo',
					life: 'ray',
				}

				const {foo} = obj;

				const length = foo.length;
			`,
		},
		{
			code: `
				const {foo, bar, life} = obj;
				const length = life.length;
			`,
			errors: [
				{
					message,
					type: 'Identifier',
				},
			],
			output: `
				const {foo, bar, life} = obj;

				const length = life.length;
			`,
		},
		{
			code: `
				const filePath = context.getFilename();
				const filename = path.basename(something, filePath);
			`,
			errors: [
				{
					message,
					type: 'Identifier',
				},
			],
			output: `
				const filePath = context.getFilename();

				const filename = path.basename(something, filePath);
			`,
		},
		{
			code: `
				for (const file of files) {
					const contents = readFileAsync(file, 'utf8');
					const length = contents.length;
				}
			`,
			errors: [
				{
					message,
					type: 'Identifier',
				},
			],
			output: `
				for (const file of files) {
					const contents = readFileAsync(file, 'utf8');

					const length = contents.length;
				}
			`,
		},
		{
			code: `
				const cbSpy = sinon.spy();
				prototype.rows = [cbSpy];
			`,
			errors: [
				{
					message,
					type: 'Identifier',
				},
			],
			output: `
				const cbSpy = sinon.spy();

				prototype.rows = [cbSpy];
			`,
		},
	],
	valid: [
		{
			code: `
				const test = 'test';

				const testLength = test.length;
			`,
		},
		{
			code: `
				const obj = {
					foo: 'bar',
					bar: 'foo',
					life: 'ray',
				}

				Object.keys(obj).map(key => {});
			`,
		},
		{
			code: `
				const obj = {
					foo: 'bar',
					bar: 'foo',
					life: 'ray',
				}

				const {foo} = obj;

				const length = foo.length;
			`,
		},
		{
			code: `
				for (const file of files) {
					const contents = readFileAsync(file, 'utf8');
				}
			`,
		},
	],
});
