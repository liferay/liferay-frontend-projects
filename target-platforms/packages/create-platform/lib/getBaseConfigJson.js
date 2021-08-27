/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

module.exports = function getBaseConfigJson(_platformName) {
	return {
		'*': {
			'.babelrc': {
				presets: ['liferay-standard'],
			},
			'copy-plugins': ['exclude-imports'],
			plugins: ['replace-browser-modules'],
			'post-plugins': [
				'namespace-packages',
				'inject-imports-dependencies',
				'inject-peer-dependencies',
			],
		},
		'/': {
			'.babelrc': {
				presets: ['liferay-standard'],
			},
			plugins: ['resolve-linked-dependencies'],
			'post-plugins': [
				'namespace-packages',
				'inject-imports-dependencies',
			],
		},
		config: {
			imports: {},
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
