/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

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

		// eslint-disable-next-line liferay/no-dynamic-require
		const instance = require(location);

		const {code, errors: expected, options} = config;

		const results = await stylelint.lint({
			code,
			codeFilename: 'test.scss',
			config: {
				plugins: [location],
				rules: {
					[instance.ruleName]: options === undefined ? true : options
				},
				syntax: 'scss'
			}
		});

		const received = results.results[0].warnings;

		return {
			message: pass => {
				const count = expected.length;

				const settings = {
					comment: `${count} error${count !== 1 ? 's' : ''}`,
					isNot: this.isNot,
					promise: this.promise
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
				} else {
					const diffString = diff(expected, received, {
						expand: this.expand
					});

					if (diffString && diffString.includes('- Expect')) {
						return hint + `Difference:\n\n${diffString}`;
					} else {
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
			pass: this.equals(received, expected)
		};
	}
});
