/**
 * © 2014 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-env node */

const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = ({flavor}) => {
	const baseConfig = {
		devtool: 'source-map',
		entry: path.resolve(__dirname, 'src/loader/bootstrap.js'),
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
			path: path.resolve(__dirname, 'build/loader'),
		},
	};

	const flavorConfig = {
		debug: {
			output: {...baseConfig.output, filename: 'loader-debug.js'},
		},
		min: {
			output: {...baseConfig.output, filename: 'loader-min.js'},
			plugins: [
				new UglifyJsPlugin({
					sourceMap: true,
				}),
			],
		},
		prod: {
			output: {...baseConfig.output, filename: 'loader.js'},
		},
	};

	return {...baseConfig, ...flavorConfig[flavor]};
};
