/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const clay = require('./dependencies/clay');
const liferay = require('./dependencies/liferay');
const metal = require('./dependencies/metal');

const JS_GLOBS = ['{src,test}/**/*.js'];
const JSP_GLOBS = ['src/**/*.{jsp,jspf}'];
const SCSS_GLOBS = ['{src,test}/**/*.scss'];

module.exports = {
	build: {
		dependencies: [...clay, ...liferay, ...metal],
		input: 'src/main/resources/META-INF/resources',
		output: 'build/node/packageRunBuild/resources',
		temp: 'build/npmscripts'
	},
	check: [...JS_GLOBS, ...JSP_GLOBS, ...SCSS_GLOBS],
	fix: [...JS_GLOBS, ...JSP_GLOBS, ...SCSS_GLOBS],
	storybook: {
		languagePaths: ['src/main/resources/content/Language.properties'],
		port: '9000',
		portalURL: 'http://0.0.0.0:8080'
	}
};
