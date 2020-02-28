/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const clay = require('./dependencies/clay');
const liferay = require('./dependencies/liferay');
const metal = require('./dependencies/metal');

const JS_GLOBS = ['/{src,test}/**/*.js'];
const JSON_GLOBS = ['/*.json'];
const JSP_GLOBS = ['/src/**/*.{jsp,jspf}'];
const SCSS_GLOBS = ['/{src,test}/**/*.scss'];

const CHECK_AND_FIX_GLOBS = [
	...JS_GLOBS,
	...JSON_GLOBS,
	...JSP_GLOBS,
	...SCSS_GLOBS,
];

module.exports = {
	build: {
		dependencies: [...clay, ...liferay, ...metal],
		input: 'src/main/resources/META-INF/resources',
		output: 'build/node/packageRunBuild/resources',
		temp: 'build/npmscripts',
	},
	check: CHECK_AND_FIX_GLOBS,
	fix: CHECK_AND_FIX_GLOBS,
	rules: {
		'blacklisted-dependency-patterns': ['^liferay-npm-bundler-loader-.+'],
	},
	storybook: {
		languagePaths: ['src/main/resources/content/Language.properties'],
		port: '9000',
		portalURL: 'http://0.0.0.0:8080',
	},
};
