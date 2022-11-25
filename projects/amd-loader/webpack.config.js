/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = () => {
	const {flavor} = process.env;

	const baseConfig = {
		devtool: 'source-map',
		entry: path.resolve(__dirname, 'src', 'loader', 'bootstrap.js'),
		module: {
			rules: [
				{
					exclude: /node_modules/,
					test: /\.js$/,
					use: [
						{
							loader: 'babel-loader',
							options: {},
						},
					],
				},
			],
		},
		output: {
			path: path.resolve(__dirname, 'build', 'loader'),
		},
	};

	const flavorConfig = {
		debug: {
			mode: 'development',
			output: {...baseConfig.output, filename: 'loader-debug.js'},
		},
		min: {
			mode: 'production',
			optimization: {
				minimize: true,
				minimizer: [new TerserPlugin()],
			},
			output: {...baseConfig.output, filename: 'loader-min.js'},
		},
		prod: {
			mode: 'production',
			output: {...baseConfig.output, filename: 'loader.js'},
		},
	};

	return {...baseConfig, ...flavorConfig[flavor]};
};
