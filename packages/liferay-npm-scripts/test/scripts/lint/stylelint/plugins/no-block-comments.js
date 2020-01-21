const diff = require('jest-diff');
const path = require('path');
const stylelint = require('stylelint');

describe('liferay/no-block-comments', () => {
	const plugin = 'liferay/no-block-comments';

	beforeEach(() => {
		expect.extend({
			async toLintStyles(plugin, config) {
				const location = path.resolve(
					__dirname,
					'../../../../../src/scripts/lint/stylelint/plugins',
					path.basename(plugin)
				);

				const instance = require(location);

				const {code, errors: expected, options} = config;

				const results = await stylelint.lint({
					codeFilename: 'test.scss',
					code,
					config: {
						plugins: [location],
						rules: {
							[instance.ruleName]:
								options === undefined ? true : options
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
								`Received: ${this.utils.printReceived(
									received
								)}`
							);
						} else {
							let diffString = diff(expected, received, {
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
									`Received: ${this.utils.printReceived(
										received
									)}`
								);
							}
						}
					},
					pass: this.equals(received, expected)
				};
			}
		});
	});

	it('accepts line-based comments', async () => {
		await expect(plugin).toLintStyles({
			code: `
				// A good comment.
				a { color: #000 };
			`,
			errors: []
		});
	});

	it('reports block-based comments as errors', async () => {
		await expect(plugin).toLintStyles({
			code: `
				/* A bad comment. */
				a { color: #000 };
			`,
			errors: [
				{
					column: 5,
					line: 2,
					rule: 'liferay/no-block-comments',
					severity: 'error',
					text:
						'No block-based comments (/* ... */); use line-based (//) comment syntax instead (liferay/no-block-comments)'
				}
			]
		});
	});

	it('can be turned off', async () => {
		await expect(plugin).toLintStyles({
			code: `
				/* A bad comment. */
				a { color: #000 };
			`,
			errors: [],
			options: false
		});
	});
});
