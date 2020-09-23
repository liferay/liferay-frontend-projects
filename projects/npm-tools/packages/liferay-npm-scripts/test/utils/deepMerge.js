/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const deepMerge = require('../../src/utils/deepMerge');

describe('deepMerge()', () => {
	it('uses the "DEFAULT" mode by default', () => {
		// DEFAULT mode concatenates arrays.

		expect(deepMerge([[1], [2]])).toEqual([1, 2]);
	});

	it('complains if passed an invalid mode', () => {
		expect(() => deepMerge([], NaN)).toThrow(/unsupported mode/);
	});

	describe('MODE.DEFAULT', () => {
		it('concatenates arrays', () => {
			expect(
				deepMerge(
					[
						[1, 2],
						['a', 'b'],
					],
					deepMerge.MODE.DEFAULT
				)
			).toEqual([1, 2, 'a', 'b']);
		});
	});

	describe('MODE.OVERWRITE_ARRAYS', () => {
		it('overwrites arrays', () => {
			expect(
				deepMerge(
					[
						[1, 2, 3],
						['a', 'b', 'c'],
					],
					deepMerge.MODE.OVERWRITE_ARRAYS
				)
			).toEqual(['a', 'b', 'c']);
		});
	});

	describe('MODE.BABEL', () => {
		it('concatenates named plugins', () => {
			expect(
				deepMerge(
					[
						{
							plugins: ['a', 'b'],
						},
						{
							plugins: ['c', 'd'],
						},
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: ['a', 'b', 'c', 'd'],
			});
		});

		it('deduplicates named plugins', () => {
			expect(
				deepMerge(
					[
						{
							plugins: ['a', 'b'],
						},
						{
							plugins: ['a', 'b', 'c'],
						},
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: ['a', 'b', 'c'],
			});
		});

		it('deduplicates irrespective of plugin order', () => {
			expect(
				deepMerge(
					[
						{
							plugins: ['b', 'a'],
						},
						{
							plugins: ['c', 'b', 'a'],
						},
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: ['b', 'a', 'c'],
			});
		});

		it('merges a named plugin into a plugin with options', () => {
			expect(
				deepMerge(
					[
						{
							plugins: [['a', {option: 1}], 'b'],
						},
						{
							plugins: ['a', 'c'],
						},
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: [['a', {option: 1}], 'b', 'c'],
			});
		});

		it('merges a plugin with options into a named plugin ', () => {
			expect(
				deepMerge(
					[
						{
							plugins: ['a', 'b'],
						},
						{
							plugins: ['c', ['b', {option: 2}]],
						},
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: ['a', ['b', {option: 2}], 'c'],
			});
		});

		it('merges two plugins with options', () => {
			expect(
				deepMerge(
					[
						{
							plugins: ['a', ['b', {bar: false, foo: true}]],
						},
						{
							plugins: [['b', {baz: null, foo: false}], 'c'],
						},
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: ['a', ['b', {bar: false, baz: null, foo: false}], 'c'],
			});
		});

		it('omits empty options objects', () => {
			expect(
				deepMerge(
					[
						{
							plugins: [['a'], 'b', ['z', {}]],
						},
						{
							plugins: [['a', {}], 'c', ['d', {}], ['e']],
						},
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: ['a', 'b', 'z', 'c', 'd', 'e'],
			});
		});

		it('merges other fields using the default strategy', () => {
			expect(
				deepMerge(
					[
						{
							ignore: ['./mocks/*.js'],
							plugins: ['a', ['b', {option: 1}]],
						},
						{
							ignore: ['./tests/*.disabled.js'],
							plugins: ['c'],
						},
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				ignore: ['./mocks/*.js', './tests/*.disabled.js'],
				plugins: ['a', ['b', {option: 1}], 'c'],
			});
		});

		it('merges presets correctly as well', () => {
			// Just a smoke test here, because it is powered by the exact same
			// code that's exercised in all the "plugins" tests above.

			expect(
				deepMerge(
					[
						{
							ignore: ['*.mjs'],
							plugins: [
								'a',
								['b', {option: 1}],
								['c', {option: 2}],
								'd',
							],
							presets: [
								['a', {targets: [1, 2]}],
								'b',
								'c',
								['d', {foo: 1}],
							],
						},
						{
							extends: 'other',
							plugins: ['d'],
							presets: [
								'a',
								['d', {bar: 3, foo: 2}],
								['e', {true: false}],
								'c',
							],
						},
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				extends: 'other',
				ignore: ['*.mjs'],
				plugins: ['a', ['b', {option: 1}], ['c', {option: 2}], 'd'],
				presets: [
					['a', {targets: [1, 2]}],
					'b',
					'c',
					['d', {bar: 3, foo: 2}],
					['e', {true: false}],
				],
			});
		});

		it("doesn't break the segments-web build (regression test)", () => {
			const localConfig = {
				plugins: [
					[
						'module-resolver',
						{
							alias: {
								test: './test/js/',
							},
							root: [
								'./src/main/resources/META-INF/resources/js/',
							],
						},
					],
				],
				presets: ['@babel/preset-react'],
			};

			const defaultConfig = {
				plugins: [
					'@babel/proposal-class-properties',
					'@babel/proposal-object-rest-spread',
				],
				presets: ['@babel/preset-env'],
			};

			expect(
				deepMerge([defaultConfig, localConfig], deepMerge.MODE.BABEL)
			).toEqual({
				plugins: [
					'@babel/proposal-class-properties',
					'@babel/proposal-object-rest-spread',
					[
						'module-resolver',
						{
							alias: {
								test: './test/js/',
							},
							root: [
								'./src/main/resources/META-INF/resources/js/',
							],
						},
					],
				],
				presets: ['@babel/preset-env', '@babel/preset-react'],
			});
		});

		it("doesn't break when a stale .babelrc.js file is left on disk", () => {
			// This is the original project-local .babelrc.js config.

			const project = {
				presets: ['@babel/preset-react'],
			};

			// This is the config provided by liferay-npm-scripts.

			const defaults = {
				overrides: [
					{
						presets: [
							[
								'@babel/preset-env',
								{
									targets: {
										node: '10.15',
									},
								},
							],
						],
						test: '**/test/**/*.js',
					},
				],
				plugins: [
					'@babel/proposal-class-properties',
					'@babel/proposal-object-rest-spread',
				],
				presets: ['@babel/preset-env'],
			};

			// This should be the result of merging "defaults" and "project"; imagine that
			// it could be left on disk if the build gets interrupted.

			const stale = {
				overrides: [
					{
						presets: [
							[
								'@babel/preset-env',
								{
									targets: {
										node: '10.15',
									},
								},
							],
						],
						test: '**/test/**/*.js',
					},
				],
				plugins: [
					'@babel/proposal-class-properties',
					'@babel/proposal-object-rest-spread',
				],
				presets: ['@babel/preset-env', '@babel/preset-react'],
			};

			expect(
				deepMerge([defaults, project], deepMerge.MODE.BABEL)
			).toEqual(stale);

			let duplicate;

			expect(() => {
				duplicate = deepMerge(
					[defaults, project],
					deepMerge.MODE.BABEL
				);
			}).not.toThrow();

			expect(duplicate).toEqual(stale);
		});

		it('complains about malformed plugin names', () => {
			expect(() => {
				deepMerge(
					[{plugins: [1]}, {plugins: []}],
					deepMerge.MODE.BABEL
				);
			}).toThrow(/malformed item/);
		});

		it('complains about non-shorthand "@babel/plugin-foo"', () => {
			expect(() => {
				deepMerge(
					[{plugins: []}, {plugins: ['@babel/plugin-foo']}],
					deepMerge.MODE.BABEL
				);
			}).toThrow('expected "@babel/foo"');
		});

		it('complains about non-shorthand "@org/babel-plugin-foo"', () => {
			expect(() => {
				deepMerge(
					[{plugins: []}, {plugins: ['@org/babel-plugin-foo']}],
					deepMerge.MODE.BABEL
				);
			}).toThrow('expected "@org/foo"');
		});

		it('complains about non-shorthand "babel-plugin-foo"', () => {
			expect(() => {
				deepMerge(
					[{plugins: []}, {plugins: ['babel-plugin-foo']}],
					deepMerge.MODE.BABEL
				);
			}).toThrow('expected "foo"');
		});

		it('complains about non-canonical "@babel/foo"', () => {
			// Note that this one is the odd one out in the sense that
			// Babel does understand both "@babel/preset-foo" and
			// "@babel/foo", but in the docs it recommends the long-hand
			// form. This is unlike plugins, where it again understands
			// both, but recommends the short-hand form.

			expect(() => {
				deepMerge(
					[{presets: []}, {presets: ['@babel/foo']}],
					deepMerge.MODE.BABEL
				);
			}).toThrow('expected "@babel/preset-foo"');
		});

		it('complains about non-shorthand "@org/babel-preset-foo"', () => {
			expect(() => {
				deepMerge(
					[{presets: []}, {presets: ['@org/babel-preset-foo']}],
					deepMerge.MODE.BABEL
				);
			}).toThrow('expected "@org/foo"');
		});

		it('complains about non-shorthand "babel-preset-foo"', () => {
			expect(() => {
				deepMerge(
					[{presets: []}, {presets: ['babel-preset-foo']}],
					deepMerge.MODE.BABEL
				);
			}).toThrow('expected "foo"');
		});
	});
});
