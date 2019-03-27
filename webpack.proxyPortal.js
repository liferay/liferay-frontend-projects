/**
 * © 2014 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-env node */

const path = require('path');

module.exports = () => ({
	mode: 'development',
	entry: path.resolve(__dirname, 'src/loader/bootstrap.js'),
	output: {
		path: path.resolve(__dirname, 'build/proxyPortal'),
		filename: 'loader.js',
	},
	devtool: 'inline-source-map',
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {},
					},
				],
			},
		],
	},
	devServer: {
		port: 9090,
		contentBase: path.join(__dirname, 'build/proxyPortal'),
		proxy: {
			'/o/frontend-js-web/loader/loader.js': {
				target: 'http://localhost:9090',
				pathRewrite: {'^/o/frontend-js-web/loader': ''},
			},
			'**': {
				target: 'http://0.0.0.0:8080',
			},
		},
	},
});
