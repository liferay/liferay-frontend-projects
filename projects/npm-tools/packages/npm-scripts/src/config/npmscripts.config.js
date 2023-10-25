/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const CHECK_AND_FIX_GLOBS = [
	'**/*.{html,js,jsx,css,scss,ts,tsx}',
	'/*.{js,ts}',
	'/{dev,extra,src,test}/**/*.{html,js,jsx,css,scss,ts,tsx}',
	'/src/**/*.{jsp,jspf}',
];

// Utility for getting paths to @clayui/css variables
// This shouldn't ever fail, but is necessary so that we don't require
// '@clayui/css' as a dependency in this package.

const getClayPaths = () => {
	try {
		return require('@clayui/css').includePaths;
	}
	catch {
		return [];
	}
};

module.exports = {
	build: {
		bundler: {
			'*': {
				'.babelrc': {
					presets: ['liferay-standard'],
				},
				'copy-plugins': ['exclude-imports'],
				'plugins': ['replace-browser-modules'],
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
				'plugins': ['resolve-linked-dependencies'],
				'post-plugins': [
					'namespace-packages',
					'inject-imports-dependencies',
				],
			},
			'ignore': ['__generated__/**/*'],
			'output': 'build/node/packageRunBuild/resources',
			'rules': [
				{
					test: '\\.css$',
					use: ['css-loader'],
				},
				{
					test: '\\.json',
					use: ['json-loader'],
				},
				{
					exclude: 'node_modules',
					test: '\\.scss$',
					use: [
						{
							loader: 'css-loader',
							options: {
								extension: '.css',
							},
						},
					],
				},
			],
			'sources': ['src/main/resources/META-INF/resources'],
		},

		// Passed to:
		// - `babel` executable (via `runBabel()`).
		// - `jest` executable (via resolver.js).

		input: 'src/main/resources/META-INF/resources',

		// Passed to:
		// - `babel` executable (via `runBabel()`).
		// - `jest` executable (via resolver.js).
		// - `minify()`.

		output: 'build/node/packageRunBuild/resources',

		// These are the paths that are used when resolving sass imports

		sassIncludePaths: [
			path.dirname(require.resolve('bourbon')),
			...getClayPaths(),
			path.dirname(require.resolve('liferay-frontend-common-css')),
		],

		// Used in various places to keep intermediate artefacts out of Gradle's
		// way (see `withTempFile()`, etc).

		temp: 'build/npmscripts',
	},
	check: CHECK_AND_FIX_GLOBS,
	fix: CHECK_AND_FIX_GLOBS,
	rules: {
		'blacklisted-dependency-patterns': [
			'^@testing-library/',
			'^liferay-npm-bundler-loader-.+',
			'^react-test-renderer$',
		],
	},
	storybook: {
		languagePaths: ['src/main/resources/content/Language.properties'],
		port: '9000',
		portalURL: 'http://0.0.0.0:8080',
	},
};
