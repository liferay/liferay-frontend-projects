/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const parser = require('@typescript-eslint/parser');
const {Linter} = require('eslint');
const {default: diff} = require('jest-diff');

/**
 * Integration tests that show how rules interact when applied together by
 * activating all the rules in a plugin at once.
 */
describe('@liferay/eslint-config/liferay', () => {
	const plugin = '@liferay/eslint-config/liferay';

	it('formats imports', () => {

		// This shows how these rules work together to format imports:
		//
		// - group-imports (keeps imports in groups)
		// - import-extensions (strips unnecessary extensions)
		// - sort-imports (sorts imports by module name)
		// - sort-import-destructures (sorts destructured items in import
		//   specifiers)

		expect(plugin).toAutofix({
			code: `
				import b from 'b';
				import type {B} from 'b';
				import type {D, C} from 'x';
				import a from 'a';
				import {d, c} from 'c';
				import thing from './thing.js';
				import another from './another';
				import 'for-side-effects';
				import type {A} from 'a';
			`,
			output: `
				import a from 'a';
				import b from 'b';
				import {c, d} from 'c';

				import another from './another';
				import thing from './thing';

				import 'for-side-effects';

				import type {A} from 'a';
				import type {B} from 'b';
				import type {C, D} from 'x';
			`,
		});
	});

	it('formats require statements', () => {

		// This shows how these rules work together to format require
		// statements:
		//
		// - group-imports (keeps require statements in groups)
		// - import-extensions (strips unnecessary extensions)
		// - sort-imports (sorts require statements by module name)
		//
		// Not in effect here:
		//
		// - sort-import-destructures (sorts destructured items in import
		//   specifiers)
		//
		// because sorting destructured items in require statements is actually
		// handled by the third-party rule:
		//
		// - sort-destructure-keys/sort-destructure-keys

		expect(plugin).toAutofix({
			code: `
				const b = require('b');
				const a = require('a');
				const {d, c} = require('c');
				const thing = require('./thing.js');
				const another = require('./another');
				require('for-side-effects');
				const property = require('./other').property;
			`,
			output: `
				const a = require('a');
				const b = require('b');
				const {d, c} = require('c');

				const another = require('./another');
				const thing = require('./thing');

				require('for-side-effects');

				const {property} = require('./other');
			`,
		});
	});

	it('formats class names in JSX', () => {

		// This shows how these rules work together to format class names in
		// JSX:
		//
		// - no-duplicate-class-names
		// - sort-class-names
		// - trim-class-names (trims whitespace)

		expect(plugin).toAutofix({
			code: `<div className="   one two one three  "></div>`,
			output: `<div className="one three two"></div>`,
		});
	});
});

describe('@liferay/eslint-config/portal', () => {
	const plugin = '@liferay/eslint-config/portal';

	// Not much to test here (yet), because most of the rules currently
	// in this plugin don't have autofixes. This test is included as a
	// placeholder reserved for future expansion.

	it('formats deprecation notices', () => {
		expect(plugin).toAutofix({
			code: `
				/**
				 * @deprecated As of Mueller (7.2) replaced by Foo
				 */
			`,
			output: `
				/**
				 * @deprecated As of Mueller (7.2.x), replaced by Foo
				 */
			`,
		});
	});
});

// Memoize linters so that we don't have to recreate them for each `it()` block.

const linters = {};

expect.extend({
	toAutofix(plugin, {code, output}) {
		const linter =
			linters[plugin] ||
			(function () {
				let rules;

				if (plugin === '@liferay/eslint-config/liferay') {
					({rules} = require('../plugins/liferay'));
				}
				else if (plugin === '@liferay/eslint-config/portal') {
					({rules} = require('../plugins/portal'));
				}
				else {
					throw new Error(`Unknown plugin: ${plugin}`);
				}

				const linter = new Linter();

				linter.defineParser('@typescript-eslint/parser', parser);

				const config = {
					parser: '@typescript-eslint/parser',
					parserOptions: {
						ecmaFeatures: {
							jsx: true,
						},
					},
					rules: {},
				};

				Object.entries(rules).forEach(([name, rule]) => {
					linter.defineRule(name, rule);
					config.rules[name] = 'error';
				});

				linters[plugin] = {
					verifyAndFix(code) {
						return linter.verifyAndFix(code, config);
					},
				};

				return linters[plugin];
			})();

		const {output: actual} = linter.verifyAndFix(code);

		return {
			actual,
			message: () => {
				const diffString = diff(output, actual, {
					expand: this.expand,
				});

				return (
					this.utils.matcherHint('toAutofix') +
					'\n\n' +
					(diffString && diffString.includes('- Expect')
						? `Difference:\n\n${diffString}`
						: `Expected: ${this.utils.printExpected(output)}\n` +
						  `Received: ${this.utils.printReceived(actual)}`)
				);
			},
			pass: output === actual,
		};
	},
});
