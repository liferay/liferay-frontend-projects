/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

/**
 * This is a custom webpack config for storybook builds.
 *
 * Exports a function which puts Storybook into full-control-mode. Accepts the
 * base config as the only param. `mode` has a value of 'DEVELOPMENT' or
 * 'PRODUCTION'. 'PRODUCTION' is used when building the static version of
 * storybook.
 *
 * Additional documentation can be read here:
 * https://storybook.js.org/docs/configurations/custom-webpack-config/
 */
module.exports = async ({config, mode}) => {
	config.module.rules = [
		...config.module.rules,
		{
			include: path.resolve(__dirname, '../../'),
			loaders: ['style-loader', 'css-loader', 'sass-loader'],
			test: /\.scss$/
		},
		{
			exclude: /node_modules/,
			test: /\.js$/,
			use: [
				{
					loader: 'liferay-lang-key-dev-loader',
					options: {
						path: './src/main/resources/content/Language.properties'
					}
				}
			]
		}
	];

	return config;
};
