/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

module.exports = {
	rules: {
		'array-is-array': require('./lib/rules/array-is-array'),
		'destructure-requires': require('./lib/rules/destructure-requires'),
		'empty-line-between-elements': require('./lib/rules/empty-line-between-elements'),
		'group-imports': require('./lib/rules/group-imports'),
		'import-extensions': require('./lib/rules/import-extensions'),
		'imports-first': require('./lib/rules/imports-first'),
		'no-abbreviations': require('./lib/rules/no-abbreviations'),
		'no-absolute-import': require('./lib/rules/no-absolute-import'),
		'no-arrow': require('./lib/rules/no-arrow'),
		'no-duplicate-class-names': require('./lib/rules/no-duplicate-class-names'),
		'no-duplicate-imports': require('./lib/rules/no-duplicate-imports'),
		'no-dynamic-require': require('./lib/rules/no-dynamic-require'),
		'no-it-should': require('./lib/rules/no-it-should'),
		'no-length-jsx-expression': require('./lib/rules/no-length-jsx-expression'),
		'no-require-and-call': require('./lib/rules/no-require-and-call'),
		'padded-test-blocks': require('./lib/rules/padded-test-blocks'),
		'sort-class-names': require('./lib/rules/sort-class-names'),
		'sort-import-destructures': require('./lib/rules/sort-import-destructures'),
		'sort-imports': require('./lib/rules/sort-imports'),
		'trim-class-names': require('./lib/rules/trim-class-names'),
	},
};
