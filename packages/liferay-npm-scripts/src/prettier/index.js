/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * @file
 *
 * Custom Prettier wrapper that applies a Liferay-specific
 * post-processing step.
 *
 * The post-processing is implemented using ESLint rules because they
 * provide us with a way to do AST-aware transformations that produce
 * small local edits without affecting the overall structure too much
 * (unlike Babel, for instance, whose output varies greatly from version
 * to version).
 */

const babelEslint = require('babel-eslint');
const {CLIEngine, Linter} = require('eslint');
const path = require('path');
const prettier = require('prettier');

const eslintConfig = require('../config/eslint.config');

const EXTENSIONS = new Set(['.js', '.jsp', '.jspf']);

const linter = new Linter();

/* eslint-disable liferay/no-require-and-call */

/**
 * Custom rule because ESLint's `'brace-style': ['error', 'stroustrup']` ignores
 * indentation (ie. it puts the "else" on a new line in column 0).
 */
linter.defineRule(
	'newline-before-block-statements',
	require('./rules/newline-before-block-statements')
);

/* eslint-enable liferay/no-require-and-call */

linter.defineParser('babel-eslint', babelEslint);

const cli = new CLIEngine({
	...eslintConfig,
	extends: [],
	globals: [],
	overrides: [],
	parserOptions: {
		...eslintConfig.parserOptions,
		sourceType: 'module'
	},
	rules: {
		'newline-before-block-statements': 'error'
	},
	useEslintrc: false
});

/**
 * Wrapper that is a drop-in replacement equivalent to `prettier.check()`.
 */
function check(source, options) {
	const formatted = format(source, options);

	return formatted === source;
}

/**
 * Wrapper that is a drop-in replacement equivalent to `prettier.format()`.
 */
function format(source, options) {
	const formatted = prettier.format(source, options);

	const filename = options.filepath || '__fallback__.js';

	const extension = path.extname(filename);

	if (!EXTENSIONS.has(extension)) {
		return formatted;
	}

	const {output} = linter.verifyAndFix(
		formatted,
		{
			...cli.getConfigForFile(filename),

			// Override "parser" value from `getConfigForFile()`, which
			// is an absolute path; make it a name that matches the
			// parser we defined with `defineParser()` above.
			parser: 'babel-eslint'
		},

		{allowInlineConfig: false, filename}
	);

	return output;
}

module.exports = {
	check,
	format
};
