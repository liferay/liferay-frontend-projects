/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

import assert from 'node:assert';
import {describe, test} from 'node:test';
import {format} from 'prettier';

import * as liferayPrettierPlugin from '../index.mjs';

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
	{
		_name: 'multiple inline comments',
		code: `const foo = 'foo';
// foo
// bar
const bar = 'bar';`,
		expected: `const foo = 'foo';

// foo
// bar

const bar = 'bar';
`,
	},
	{
		_name: 'shebang directive next to inline comment',
		code: `#!/usr/bin/env
// test`,
		expected: `#!/usr/bin/env
// test
`,
	},
	{
		_name: 'shebang directive next to block comment',
		code: `#!/usr/bin/env
/*
 * foo
 */`,
		expected: `#!/usr/bin/env
/*
 * foo
 */
`,
	},
	{
		_name: 'tab indented comments',
		code: `if (true) {
	// foo
	// bar
	return false;
}`,
		expected: `if (true) {

	// foo
	// bar

	return false;
}
`,
	},
	{
		_name: 'tab indented with inline comments',
		code: `if (true) {
var foo = 'test'; // foo
// bar
return false;
}`,
		expected: `if (true) {
	var foo = 'test'; // foo

	// bar

	return false;
}
`,
	},
	{
		_name: 'disable line after if it is an "ignore" comment',
		code: `if (true) {
// eslint-disable-next-line
var foo = 'test'; // foo
return false;
}`,
		expected: `if (true) {

	// eslint-disable-next-line
	var foo = 'test'; // foo
	return false;
}
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
