/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable @liferay/no-dynamic-require */

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const convertImportsToExternals = require('./convertImportsToExternals');

module.exports = function getInternalExportsWebpackConfigs(
	projectDir,
	buildConfig,
	babelConfig
) {
	const {exports, imports} = buildConfig;

	const externals = convertImportsToExternals(imports, 2);

	return exports
		.filter((exportsItem) => exportsItem.path.startsWith('.'))
		.reduce((webpackConfigs, exportsItem) => {
			const exportsItemFilePath = path.resolve(
				projectDir,
				exportsItem.path
			);

			const webpackConfig = {
				entry: {
					[exportsItem.name]: {
						import: exportsItemFilePath,
					},
				},
				experiments: {
					outputModule: true,
				},
				externals,
				externalsType: 'module',
				module: {
					rules: [
						{
							exclude: /node_modules/,
							test: /\.jsx?$/,
							use: {
								loader: require.resolve('babel-loader'),
								options: babelConfig,
							},
						},
						{
							exclude: /node_modules/,
							test: /\.scss$/,
							use: [
								{
									loader: require.resolve(
										'./webpackScssLoader'
									),
									options: {
										buildConfig,
										projectDir,
									},
								},
							],
						},
						{
							exclude: /node_modules/,
							test: /\.tsx?/,
							use: {
								loader: require.resolve('babel-loader'),
								options: babelConfig,
							},
						},
					],
				},
				optimization: {
					minimize: true,
					minimizer: [
						new TerserPlugin({
							terserOptions: {
								keep_classnames: true,
								keep_fnames: true,
							},
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
					path: path.resolve(buildConfig.output),
				},
				plugins: [],
				resolve: {
					extensions: ['.js', '.jsx', '.ts', '.tsx'],
					fallback: {
						path: false,
					},
				},
			};

			if (process.env.NODE_ENV === 'development') {
				webpackConfig.devtool = 'source-map';
				webpackConfig.mode = 'development';
			}
			else {
				webpackConfig.devtool = false;
				webpackConfig.mode = 'production';
			}

			webpackConfigs.push(webpackConfig);

			return webpackConfigs;
		}, []);
};
