/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {Linter} = require('eslint');
const prettier = require('prettier');

const linter = new Linter();

linter.defineRule(
	'newline-before-block-statements',
	require('./rules/newline-before-block-statements')
);

const rules = {
	// BUG: you'd think that brace-style would give us exactly what we want,
	// but, amazingly, it seems to ignore indentation...
	// 'brace-style': ['error', 'stroustrup'],
	'newline-before-block-statements': 'error',
};

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

	const {output} = linter.verifyAndFix(formatted, {rules});

	return output;
}

module.exports = {
	check,
	format,
};
