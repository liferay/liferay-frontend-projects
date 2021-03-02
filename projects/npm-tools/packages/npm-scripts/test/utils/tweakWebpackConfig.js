/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const {
	container: {ModuleFederationPlugin},
} = require('webpack');

const getMergedConfig = require('../../src/utils/getMergedConfig');
const tweakWebpackConfig = require('../../src/utils/tweakWebpackConfig');
const getFixturePath = require('../../support/getFixturePath');

const BABEL_CONFIG = getMergedConfig('babel');

describe('tweakWebpackConfig() without federation', () => {
	it('returns unchanged config when it doesn\'t include a "module" field', async () => {
		const webpackConfigPath = getFixturePath(
			'utils',
			'tweakWebpackConfig',
			'empty.webpack.config.js'
		);

		expect(await tweakWebpackConfig(webpackConfigPath)).toEqual({});
	});

	it("returns unchanged config when module configs don't include rules", async () => {
		const webpackConfigPath = getFixturePath(
			'utils',
			'tweakWebpackConfig',
			'empty.module.webpack.config.js'
		);

		expect(await tweakWebpackConfig(webpackConfigPath)).toEqual({
			module: {},
		});
	});

	it('returns unchanged rules when they don\'t include a "use" field', async () => {
		const webpackConfigPath = getFixturePath(
			'utils',
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
			'utils',
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
			'utils',
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

describe('tweakWebpackConfig() with federation', () => {
	let savedCwd;

	beforeEach(() => {
		savedCwd = process.cwd();

		const directory = fs.mkdtempSync(
			path.join(os.tmpdir(), 'tweakWebpackConfig-')
		);

		process.chdir(directory);

		['bnd.bnd', 'index.js', 'package.json'].forEach((file) => {
			fs.copyFileSync(
				getFixturePath('utils', 'tweakWebpackConfig', file),
				file
			);
		});

		fs.writeFileSync(
			'npmscripts.config.js',
			`
module.exports = {
	build: {
		input: '${directory}'
	},
	federation: {}
}
		`
		);
	});

	afterEach(() => {
		process.chdir(savedCwd);
	});

	it('adds the federation configuration', async () => {
		const webpackConfigPath = getFixturePath(
			'utils',
			'tweakWebpackConfig',
			'empty.webpack.config.js'
		);

		const config = await tweakWebpackConfig(webpackConfigPath);

		expect(config).toHaveLength(2);
		expect(config[0]).toEqual({});
	});

	it('correctly configures federation build input and output', async () => {
		const webpackConfigPath = getFixturePath(
			'utils',
			'tweakWebpackConfig',
			'empty.webpack.config.js'
		);

		const tweakedConfig = await tweakWebpackConfig(webpackConfigPath);

		const [, config] = tweakedConfig;

		expect(config).toMatchObject({
			context: process.cwd(),
			devtool: 'source-map',
			output: {
				path: path.resolve(
					'./build/node/packageRunBuild/resources/__generated__'
				),
				publicPath: '/o/frontend-js-web/__generated__/',
			},
		});

		const entryContent = fs.readFileSync(config.entry).toString();

		expect(entryContent).toBe('');
	});

	it('correctly configures federation build rules', async () => {
		const webpackConfigPath = getFixturePath(
			'utils',
			'tweakWebpackConfig',
			'empty.webpack.config.js'
		);

		const tweakedConfig = await tweakWebpackConfig(webpackConfigPath);

		const [, config] = tweakedConfig;

		const {rules} = config.module;

		expect(rules).toHaveLength(2);

		expect(rules[0]).toMatchObject({
			exclude: /node_modules/,
			test: /.js$/,
			use: {
				loader: 'babel-loader',
			},
		});

		expect(rules[1]).toMatchObject({
			exclude: /node_modules/,
			test: /.scss$/,
			use: ['style-loader', 'css-loader', 'sass-loader'],
		});
	});

	it('correctly configures federation plugin', async () => {
		const webpackConfigPath = getFixturePath(
			'utils',
			'tweakWebpackConfig',
			'empty.webpack.config.js'
		);

		const tweakedConfig = await tweakWebpackConfig(webpackConfigPath);

		const [, config] = tweakedConfig;

		const {plugins} = config;

		expect(plugins).toHaveLength(1);
		expect(plugins[0]).toBeInstanceOf(ModuleFederationPlugin);
	});
});
