/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const clay = require('./dependencies/clay');
const liferay = require('./dependencies/liferay');
const metal = require('./dependencies/metal');

/**
 * We need to (redundantly) include both "*.es.js" and "*.js" in the JS
 * globs in order to pacify ESLint. If we use "*.js" alone, then it will
 * complain if we try to use an `.eslintignore` file with contents like
 * this:
 *
 *      *.js
 *      !*.es.js
 *
 * ie. if the intent is to lint only "modern" ("*.es.js") files, and we
 * pass just "*.js" as a glob, ESLint will error:
 *
 *      You are linting "*.js", but all of the files matching the glob
 *      pattern "*.js" are ignored.
 *
 * With this hack, we can still run Prettier over all "*.js", but focus ESLint
 * on "*.es.js" alone.
 */
const JS_GLOBS = ['{src,test}/**/*.es.js', '{src,test}/**/*.js'];

module.exports = {
	build: {
		dependencies: [...clay, ...liferay, ...metal],
		input: 'src/main/resources/META-INF/resources',
		output: 'classes/META-INF/resources'
	},
	check: [...JS_GLOBS, '{src,test}/**/*.scss'],
	fix: [...JS_GLOBS, '{src,test}/**/*.scss']
};
