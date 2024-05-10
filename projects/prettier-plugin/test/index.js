/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert';
import {describe, test} from 'node:test';
import {format} from 'prettier';

import * as liferayPrettierPlugin from '../index.js';

const baseConfig = {
	bracketSpacing: false,
	plugins: [liferayPrettierPlugin],
	singleQuote: true,
	tabWidth: 4,
	useTabs: true,
};

const babelConfig = {
	...baseConfig,
	parser: 'babel',
};

const tsConfig = {
	...baseConfig,
	parser: 'typescript',
};

const fixtures = [
	{
		_name: 'inline comment',
		code: `const foo = 'foo';
		// test
		const bar = 'bar';`,
		expected: `const foo = 'foo';

// test

const bar = 'bar';
`,
	},
	{
		_name: 'block comment',
		code: `const foo = 'foo';
/*
 * blah
 */
const bar = 'bar';`,
		expected: `const foo = 'foo';

/*
 * blah
 */
const bar = 'bar';
`,
	},
];

describe('babel', () => {
	test('prettier runs', async () => {
		const code = `if (foo) {}`;

		assert.ok(await format(code, babelConfig));
	});

	fixtures.forEach((fixture) => {
		test(fixture._name, async () => {
			assert.equal(
				await format(fixture.code, babelConfig),
				fixture.expected
			);
		});
	});
});

describe('typescript', () => {
	test('prettier runs', async () => {
		const code = `if (foo) {}`;

		assert.ok(await format(code, tsConfig));
	});

	fixtures.forEach((fixture) => {
		test(fixture._name, async () => {
			assert.equal(
				await format(fixture.code, tsConfig),
				fixture.expected
			);
		});
	});
});
