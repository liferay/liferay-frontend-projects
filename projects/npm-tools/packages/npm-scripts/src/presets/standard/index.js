/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const clay = require('./dependencies/clay');
const liferay = require('./dependencies/liferay');
const metal = require('./dependencies/metal');

const CHECK_AND_FIX_GLOBS = [
	'/*.{js,json,ts}',
	'/{src,test}/**/*.{js,scss,ts,tsx}',
	'/src/**/*.{jsp,jspf}',
];

module.exports = {
	build: {

		// Passed to:
		// - `metalsoy` executable (via `generateSoyDependencies()`).

		dependencies: [...clay, ...liferay, ...metal],

		// Used to determine if the build process should also build scss files.
		// This flag should only be used as we migrate liferay-portal from
		// away from build css with java.

		disableSass: false,

		// Passed to:
		// - `babel` executable (via `runBabel()`).
		// - `jest` executable (via resolver.js).
		// - `metalsoy` executable (via `buildSoy()`).

		input: 'src/main/resources/META-INF/resources',

		// Passed to:
		// - `babel` executable (via `runBabel()`).
		// - `jest` executable (via resolver.js).
		// - `translateSoy()`.
		// - `minify()`.

		output: 'build/node/packageRunBuild/resources',

		// Used in various places to keep intermediate artefacts out of Gradle's
		// way (see `buildSoy()`, `withTempFile()`, etc).

		temp: 'build/npmscripts',
	},
	check: CHECK_AND_FIX_GLOBS,
	federation: false,
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
