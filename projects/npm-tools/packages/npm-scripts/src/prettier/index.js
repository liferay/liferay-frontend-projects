/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
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

const typescriptEslint = require('@typescript-eslint/parser');
const babelEslint = require('babel-eslint');
const {CLIEngine, Linter} = require('eslint');
const path = require('path');
const prettier = require('prettier');

const eslintConfig = require('../config/eslint.config');
const {ID_END, ID_START} = require('../jsp/getPaddedReplacement');
const {SCRIPTLET_CONTENT} = require('../jsp/substituteTags');
const {BLOCK_CLOSE, BLOCK_OPEN} = require('../jsp/tagReplacements');
const {FILLER_CHAR, SPACE_CHAR, TAB_CHAR} = require('../jsp/toFiller');
const resolvePluginsRelativeTo = require('../utils/resolveEslintPluginsRelativeTo');
const rule = require('./rules/newline-before-block-statements');

const EXTENSIONS = {
	'.js': 'babel-eslint',
	'.jsp': 'babel-eslint',
	'.jspf': 'babel-eslint',
	'.ts': '@typescript-eslint/parser',
	'.tsx': '@typescript-eslint/parser',
};

const LINTERS = {
	'@typescript-eslint/parser': {
		linter: new Linter(),
		parser: typescriptEslint,
	},
	'babel-eslint': {
		linter: new Linter(),
		parser: babelEslint,
	},
};

/**
 * Custom rule because ESLint's `'brace-style': ['error', 'stroustrup']` ignores
 * indentation (ie. it puts the "else" on a new line in column 0).
 */
for (const [name, {linter, parser}] of Object.entries(LINTERS)) {
	linter.defineRule('newline-before-block-statements', rule);

	linter.defineParser(name, parser);
}

const cli = new CLIEngine({
	...eslintConfig,
	extends: [],
	globals: [],
	overrides: [],
	parserOptions: {
		...eslintConfig.parserOptions,
		sourceType: 'module',
	},
	resolvePluginsRelativeTo,
	rules: {
		'lines-around-comment': [
			'error',
			{
				afterBlockComment: false,
				afterLineComment: true,
				allowArrayEnd: false,
				allowArrayStart: false,
				allowBlockEnd: false,
				allowBlockStart: false,
				allowClassStart: false,
				allowObjectEnd: false,
				allowObjectStart: false,
				beforeBlockComment: true,
				beforeLineComment: true,

				// Don't mess with placeholder comments inserted by JSP
				// formatter.

				ignorePattern: [
					BLOCK_CLOSE,
					BLOCK_OPEN,
					FILLER_CHAR,
					ID_END,
					ID_START,
					SCRIPTLET_CONTENT,
					SPACE_CHAR,
					TAB_CHAR,
				].join('|'),
			},
		],
		'newline-before-block-statements': 'error',
	},
	useEslintrc: false,
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

	const parser = EXTENSIONS[extension];

	if (!parser) {
		return formatted;
	}

	const linter = LINTERS[parser].linter;

	const {output} = linter.verifyAndFix(
		formatted,
		{
			...cli.getConfigForFile(filename),

			// Override "parser" value from `getConfigForFile()`, which
			// is an absolute path; make it a name that matches the
			// parser we defined with `defineParser()` above.

			parser,
		},

		{allowInlineConfig: false, filename}
	);

	return output;
}

module.exports = {
	check,
	format,
};
