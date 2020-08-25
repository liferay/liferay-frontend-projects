/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getMergedConfig = require('../../src/utils/getMergedConfig');
const mergeBabelLoaderOptions = require('../../src/utils/mergeBabelLoaderOptions');

const BABEL_CONFIG = getMergedConfig('babel');

describe('mergeBabelLoaderOptions()', () => {
	it('returns unchanged config when it doesn\'t include a "module" field', () => {
		const config = {};

		expect(mergeBabelLoaderOptions(config)).toEqual(config);
	});

	it("returns unchanged config when module configs don't include rules", () => {
		const config = {module: {}};

		expect(mergeBabelLoaderOptions(config)).toEqual(config);
	});

	it('returns unchanged rules when they don\'t include a "use" field', () => {
		const config = {
			module: {
				rules: [
					{
						exclude: /node_modules/,
						test: /\.(js|jsx)$/,
					},
				],
			},
		};

		expect(mergeBabelLoaderOptions(config)).toEqual(config);
	});

	it('returns unchanged rules the loader is not the babel-loader', () => {
		const config = {
			module: {
				rules: [
					{
						test: /\.(js|jsx)$/,
						use: 'ts-loader',
					},
					{
						test: /\.(js|jsx)$/,
						use: ['ts-loader'],
					},
				],
			},
		};

		expect(mergeBabelLoaderOptions(config)).toEqual(config);
	});

	it('merges babel options when the loader is the babel-loader', () => {
		const config = {
			module: {
				rules: [
					{
						test: /\.(js|jsx)$/,
						use: 'babel-loader',
					},
					{
						test: /\.(js|jsx)$/,
						use: [
							{
								loader: 'babel-loader',
							},
						],
					},
				],
			},
		};

		const merged = mergeBabelLoaderOptions(config);

		expect(merged.module.rules[0].use.options).toEqual(BABEL_CONFIG);
		expect(merged.module.rules[1].use[0].options).toEqual(BABEL_CONFIG);
	});
});
