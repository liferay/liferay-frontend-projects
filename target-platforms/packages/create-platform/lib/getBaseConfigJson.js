/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

module.exports = function getBaseConfigJson(platformName) {
	return {
		'/': {
			plugins: ['resolve-linked-dependencies'],
			'.babelrc': {
				presets: ['liferay-standard'],
			},
			'post-plugins': [
				'namespace-packages',
				'inject-imports-dependencies',
			],
		},
		'*': {
			'copy-plugins': ['exclude-imports'],
			plugins: ['replace-browser-modules'],
			'.babelrc': {
				presets: ['liferay-standard'],
			},
			'post-plugins': [
				'namespace-packages',
				'inject-imports-dependencies',
				'inject-peer-dependencies',
			],
		},
		'create-jar': {
			'output-dir': 'dist',
		},
		rules: [
			{
				test: '\\.css$',
				use: ['css-loader'],
			},
			{
				exclude: 'node_modules',
				test: '.*/[^_][^/]+\\.scss$',
				use: [
					{
						loader: 'css-loader',
						options: {
							emitCssFile: false,
							extension: '.css',
						},
					},
				],
			},
		],
		sources: ['src'],
	};
};
