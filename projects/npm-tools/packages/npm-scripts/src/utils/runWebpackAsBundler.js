/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const convertImportsToExternals = require('./convertImportsToExternals');
const flattenPkgName = require('./flattenPkgName');
const runWebpack = require('./runWebpack');

/**
 * Runs webpack as a replacement of the bundler
 */
module.exports = async function runWebpackAsBundler(config) {
	const webpackConfig = getWebpackConfig(config);

	await runWebpack(webpackConfig);
};

function getWebpackConfig(config) {
	const {exports, imports} = config;

	return {
		devtool: 'cheap-source-map',
		entry: exports.reduce((entry, pkgName) => {
			const flatPkgName = flattenPkgName(pkgName);

			entry[`__liferay__/exports/${flatPkgName}`] = {
				import: pkgName,
			};

			return entry;
		}, {}),
		experiments: {
			outputModule: true,
		},
		externals: convertImportsToExternals(imports),
		externalsType: 'module',
		mode: 'development',
		module: {
			rules: [
				{
					exclude: /node_modules/,
					test: /\.js$/,
					use: {
						loader: require.resolve('babel-loader'),
						options: {
							presets: [
								require.resolve('@babel/preset-env'),
								require.resolve('@babel/preset-react'),
							],
						},
					},
				},
			],
		},
		optimization: {
			minimizer: [
				new TerserPlugin({
					extractComments: false,
				}),
			],
		},
		output: {
			environment: {
				dynamicImport: true,
				module: true,
			},
			filename: '[name].js',
			library: {
				type: 'module',
			},
			path: path.resolve(config.output),
		},
		plugins: [],
	};
}
