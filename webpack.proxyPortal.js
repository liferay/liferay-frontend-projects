/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-env node */

const path = require('path');

module.exports = () => ({
	devServer: {
		contentBase: path.join(__dirname, 'build/proxyPortal'),
		port: 9090,
		proxy: {
			'/o/frontend-js-web/loader/loader.js': {
				pathRewrite: {'^/o/frontend-js-web/loader': ''},
				target: 'http://localhost:9090',
			},

			// eslint-disable-next-line sort-keys
			'**': {
				target: 'http://0.0.0.0:8080',
			},
		},
	},
	devtool: 'inline-source-map',
	entry: path.resolve(__dirname, 'src/loader/bootstrap.js'),
	mode: 'development',
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
		filename: 'loader.js',
		path: path.resolve(__dirname, 'build/proxyPortal'),
	},
});
