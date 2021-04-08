/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const getMergedConfig = require('../../src/utils/getMergedConfig');
const tweakWebpackConfig = require('../../src/webpack/tweakWebpackConfig');
const getFixturePath = require('../../support/getFixturePath');

const BABEL_CONFIG = getMergedConfig('babel');
const savedCwd = process.cwd();

beforeEach(() => {
	process.chdir(
		path.join(__dirname, '../../__fixtures__/webpack/tweakWebpackConfig')
	);
});

afterEach(() => {
	process.chdir(savedCwd);
});

describe('tweakWebpackConfig() without federation', () => {
	it('returns unchanged config when it doesn\'t include a "module" field', async () => {
		const webpackConfigPath = getFixturePath(
			'webpack',
			'tweakWebpackConfig',
			'empty.webpack.config.js'
		);

		expect(await tweakWebpackConfig(webpackConfigPath)).toEqual({});
	});

	it("returns unchanged config when module configs don't include rules", async () => {
		const webpackConfigPath = getFixturePath(
			'webpack',
			'tweakWebpackConfig',
			'empty.module.webpack.config.js'
		);

		expect(await tweakWebpackConfig(webpackConfigPath)).toEqual({
			module: {},
		});
	});

	it('returns unchanged rules when they don\'t include a "use" field', async () => {
		const webpackConfigPath = getFixturePath(
			'webpack',
			'tweakWebpackConfig',
			'rules.without.use.webpack.config.js'
		);

		expect(await tweakWebpackConfig(webpackConfigPath)).toEqual({
			module: {
				rules: [
					{
						exclude: /node_modules/,
						test: /\.(js|jsx)$/,
					},
				],
			},
		});
	});

	it('returns unchanged rules when the loader is not the babel-loader', async () => {
		const webpackConfigPath = getFixturePath(
			'webpack',
			'tweakWebpackConfig',
			'rules.without.babel.loader.webpack.config.js'
		);

		expect(await tweakWebpackConfig(webpackConfigPath)).toEqual({
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
		});
	});

	it('merges babel options when the loader is the babel-loader', async () => {
		const webpackConfigPath = getFixturePath(
			'webpack',
			'tweakWebpackConfig',
			'rules.with.babel.loader.webpack.config.js'
		);

		expect(await tweakWebpackConfig(webpackConfigPath)).toEqual({
			module: {
				rules: [
					{
						test: /\.(js|jsx)$/,
						use: {
							loader: 'babel-loader',
							options: BABEL_CONFIG,
						},
					},
					{
						test: /\.(js|jsx)$/,
						use: [
							{
								loader: 'babel-loader',
								options: {
									...BABEL_CONFIG,
									include: 'bruno',
								},
							},
						],
					},
				],
			},
		});
	});
});
