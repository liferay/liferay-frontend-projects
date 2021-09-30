/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-env jest */

const diff = require('jest-diff');
const path = require('path');
const stylelint = require('stylelint');

expect.extend({
	async toLintStyles(plugin, config) {
		const location = path.resolve(
			__dirname,
			'../../../src/scripts/lint/stylelint/plugins',
			path.basename(plugin)
		);

		// eslint-disable-next-line @liferay/no-dynamic-require
		const instance = require(location);

		const {code, errors, options, output} = config;

		const fix = output !== undefined;

		const results = await stylelint.lint({
			code,
			codeFilename: 'test.scss',
			config: {
				plugins: [location],
				rules: {
					[instance.ruleName]: options === undefined ? true : options,
				},
				syntax: 'scss',
			},
			fix,
		});

		const expected = {errors};

		const received = {
			errors: results.results[0].warnings,
		};

		if (fix) {
			expected.output = output;
			received.output = results.output;
		}

		return {
			message: (pass) => {
				const count = errors.length;

				const settings = {
					comment: `${count} error${count !== 1 ? 's' : ''}`,
					isNot: this.isNot,
					promise: this.promise,
				};

				const hint =
					this.utils.matcherHint(
						'toLintStyles',
						JSON.stringify(plugin),
						'config',
						settings
					) + '\n\n';

				if (pass) {
					return (
						hint +
						`Expected: not ${this.utils.printExpected(
							expected
						)}\n` +
						`Received: ${this.utils.printReceived(received)}`
					);
				}
				else {
					const diffString = diff(expected, received, {
						expand: this.expand,
					});

					if (diffString && diffString.includes('- Expect')) {
						return hint + `Difference:\n\n${diffString}`;
					}
					else {
						return (
							hint +
							`Expected: ${this.utils.printExpected(
								expected
							)}\n` +
							`Received: ${this.utils.printReceived(received)}`
						);
					}
				}
			},
			pass: this.equals(received, expected),
		};
	},
});
