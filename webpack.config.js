/* eslint-env node */

const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const {WebpackClearConsole} = require('webpack-clear-console');

module.exports = ({flavor}) => {
	const baseConfig = {
		entry: path.resolve(__dirname, 'src/loader/bootstrap.js'),
		output: {
			path: path.resolve(__dirname, 'build/loader'),
		},
		devtool: 'source-map',
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
	};

	const flavorConfig = {
		debug: {
			output: Object.assign({}, baseConfig.output, {
				filename: 'loader-debug.js',
			}),
		},
		prod: {
			output: Object.assign({}, baseConfig.output, {
				filename: 'loader.js',
			}),
			plugins: [new WebpackClearConsole()],
		},
		min: {
			output: Object.assign({}, baseConfig.output, {
				filename: 'loader-min.js',
			}),
			plugins: [
				new UglifyJsPlugin({
					sourceMap: true,
					uglifyOptions: {
						compress: {
							drop_console: true,
						},
					},
				}),
			],
		},
	};

	return Object.assign({}, baseConfig, flavorConfig[flavor]);
};
