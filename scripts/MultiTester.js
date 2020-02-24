/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const {RuleTester} = require('eslint');

/**
 * Wrapper for ESLint's RuleTester class that runs tests against both the
 * standard ("espree") parser and the `@typescript-eslint/parser` one.
 */
class MultiTester extends RuleTester {
	constructor(options) {
		super(options);

		this._liferay = {
			parsers: {
				espree: new RuleTester(options),
				typescript: new RuleTester({
					...options,
					parser: require.resolve('@typescript-eslint/parser'),
				}),
			},
		};
	}

	run(name, rule, tests) {
		Object.entries(this._liferay.parsers).forEach(([key, parser]) => {
			parser.run(`${name} (parser: ${key})`, rule, tests);
		});
	}
}

module.exports = MultiTester;
