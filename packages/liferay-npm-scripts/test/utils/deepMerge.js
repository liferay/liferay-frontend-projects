/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
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
				deepMerge([[1, 2], ['a', 'b']], deepMerge.MODE.DEFAULT)
			).toEqual([1, 2, 'a', 'b']);
		});
	});

	describe('MODE.OVERWRITE_ARRAYS', () => {
		it('overwrites arrays', () => {
			expect(
				deepMerge(
					[[1, 2, 3], ['a', 'b', 'c']],
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
							plugins: ['a', 'b']
						},
						{
							plugins: ['c', 'd']
						}
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: ['a', 'b', 'c', 'd']
			});
		});

		it('deduplicates named plugins', () => {
			expect(
				deepMerge(
					[
						{
							plugins: ['a', 'b']
						},
						{
							plugins: ['a', 'b', 'c']
						}
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: ['a', 'b', 'c']
			});
		});

		it('deduplicates irrespective of plugin order', () => {
			expect(
				deepMerge(
					[
						{
							plugins: ['b', 'a']
						},
						{
							plugins: ['c', 'b', 'a']
						}
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: ['b', 'a', 'c']
			});
		});

		it('merges a named plugin into a plugin with options', () => {
			expect(
				deepMerge(
					[
						{
							plugins: [['a', {option: 1}], 'b']
						},
						{
							plugins: ['a', 'c']
						}
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: [['a', {option: 1}], 'b', 'c']
			});
		});

		it('merges a plugin with options into a named plugin ', () => {
			expect(
				deepMerge(
					[
						{
							plugins: ['a', 'b']
						},
						{
							plugins: ['c', ['b', {option: 2}]]
						}
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: ['a', ['b', {option: 2}], 'c']
			});
		});

		it('merges two plugins with options', () => {
			expect(
				deepMerge(
					[
						{
							plugins: ['a', ['b', {foo: true, bar: false}]]
						},
						{
							plugins: [['b', {foo: false, baz: null}], 'c']
						}
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: ['a', ['b', {foo: false, bar: false, baz: null}], 'c']
			});
		});

		it('omits empty options objects', () => {
			expect(
				deepMerge(
					[
						{
							plugins: [['a'], 'b', ['z', {}]]
						},
						{
							plugins: [['a', {}], 'c', ['d', {}], ['e']]
						}
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: ['a', 'b', 'z', 'c', 'd', 'e']
			});
		});

		it('merges other fields using the default strategy', () => {
			expect(
				deepMerge(
					[
						{
							plugins: ['a', ['b', {option: 1}]],
							ignore: ['./mocks/*.js']
						},
						{
							plugins: ['c'],
							ignore: ['./tests/*.disabled.js']
						}
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: ['a', ['b', {option: 1}], 'c'],
				ignore: ['./mocks/*.js', './tests/*.disabled.js']
			});
		});

		it('merges presets correctly as well', () => {
			// Just a smoke test here, because it is powered by the exact same
			// code that's exercised in all the "plugins" tests above.
			expect(
				deepMerge(
					[
						{
							plugins: [
								'a',
								['b', {option: 1}],
								['c', {option: 2}],
								'd'
							],
							presets: [
								['a', {targets: [1, 2]}],
								'b',
								'c',
								['d', {foo: 1}]
							],
							ignore: ['*.mjs']
						},
						{
							plugins: ['d'],
							presets: [
								'a',
								['d', {foo: 2, bar: 3}],
								['e', {true: false}],
								'c'
							],
							extends: 'other'
						}
					],
					deepMerge.MODE.BABEL
				)
			).toEqual({
				plugins: ['a', ['b', {option: 1}], ['c', {option: 2}], 'd'],
				presets: [
					['a', {targets: [1, 2]}],
					'b',
					'c',
					['d', {foo: 2, bar: 3}],
					['e', {true: false}]
				],
				ignore: ['*.mjs'],
				extends: 'other'
			});
		});

		it("doesn't break the segments-web build (regression test)", () => {
			const localConfig = {
				presets: ['@babel/preset-react'],
				plugins: [
					[
						'module-resolver',
						{
							root: [
								'./src/main/resources/META-INF/resources/js/'
							],
							alias: {
								test: './test/js/'
							}
						}
					]
				]
			};

			const defaultConfig = {
				presets: ['@babel/preset-env'],
				plugins: [
					'@babel/proposal-class-properties',
					'@babel/proposal-object-rest-spread'
				]
			};

			expect(
				deepMerge([defaultConfig, localConfig], deepMerge.MODE.BABEL)
			).toEqual({
				presets: ['@babel/preset-env', '@babel/preset-react'],
				plugins: [
					'@babel/proposal-class-properties',
					'@babel/proposal-object-rest-spread',
					[
						'module-resolver',
						{
							root: [
								'./src/main/resources/META-INF/resources/js/'
							],
							alias: {
								test: './test/js/'
							}
						}
					]
				]
			});
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
