/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

module.exports = {
	rules: {
		'destructure-requires': require('./lib/rules/destructure-requires'),
		'group-imports': require('./lib/rules/group-imports'),
		'imports-first': require('./lib/rules/imports-first'),
		'no-absolute-import': require('./lib/rules/no-absolute-import'),
		'no-duplicate-imports': require('./lib/rules/no-duplicate-imports'),
		'no-dynamic-require': require('./lib/rules/no-dynamic-require'),
		'no-it-should': require('./lib/rules/no-it-should'),
		'padded-test-blocks': require('./lib/rules/padded-test-blocks'),
		'sort-imports': require('./lib/rules/sort-imports'),
	},
};
