/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {CLIEngine, Linter} = require('eslint');
const path = require('path');
const prettier = require('prettier');

const config = require('../../config/eslint.config');

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

const cli = new CLIEngine({
	...config,
	extends: [],
	globals: [],
	overrides: [],
	parserOptions: {
		...config.parserOptions,
		sourceType: 'module'
	},
	rules: {
		'newline-before-block-statements': 'error'
	},
	useEslintrc: false
});

/**
 * Custom Prettier wrapper that applies a Liferay-specific
 * post-processing step.
 *
 * We use ESLint rules to apply AST-aware transformations because they make it
 * relatively easy to make local edits without affecting the overall structure
 * too much (unlike Babel, for instance, whose output varies greatly from
 * version to version).
 */

function check(source, options) {
	const formatted = format(source, options);

	return formatted === source;
}

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

			// Sadly, I can't explain why we need this (I got here
			// by trial and error): This overwrites the parser
			// ("babel-eslint") and allows us to process snippets
			// containing ES6 features; without this, the linter
			// silently errors and returns the original source
			// unmodified.
			parser: undefined
		},

		{allowInlineConfig: false, filename}
	);

	return output;
}

module.exports = {
	check,
	format
};
