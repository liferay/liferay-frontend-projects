/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getFixturePath = require('../../support/getFixturePath');

const MODULES = getFixturePath('scripts', 'lint', 'modules');

describe('scripts/lint.js', () => {
	let cwd;
	let globs;

	beforeEach(() => {
		cwd = process.cwd();
		globs = ['**/*.js'];
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	/**
	 * Helper to avoid some verbose repeated mock set-up.
	 */
	async function run(callback) {
		jest.resetModules();

		jest.isolateModules(() => {
			jest.mock('eslint');
			jest.mock('../../src/utils/log');

			// Use [] here to avoid unwanted hoisting by
			// babel-plugin-jest-hoist.

			jest['mock']('../../src/utils/getMergedConfig', () => {
				return () => {
					return globs;
				};
			});

			const eslint = require('eslint');
			const lint = require('../../src/scripts/lint');
			const log = require('../../src/utils/log');

			callback({eslint, lint, log});
		});
	}

	describe('when no appropriate globs are provided', () => {
		beforeEach(() => {
			globs = ['**/*.java'];
		});

		it('logs a message', async () => {
			await run(async ({lint, log}) => {
				await lint();

				expect(log).toBeCalledWith(
					expect.stringContaining('No globs applicable')
				);
			});
		});

		it('does not spawn "eslint"', async () => {
			await run(async ({eslint, lint}) => {
				await lint();

				expect(
					eslint.CLIEngine.prototype.executeOnFiles
				).not.toBeCalled();
			});
		});
	});

	describe('when running from the top-level "modules/"  directory', () => {
		let INIT_CWD;

		beforeEach(() => {
			INIT_CWD = process.env.INIT_CWD;

			process.env.INIT_CWD = MODULES;

			process.chdir(MODULES);
		});

		afterEach(() => {
			process.env.INIT_CWD = INIT_CWD;
		});

		it("calls ESLint's `executeOnFiles()` function", async () => {
			await run(async ({eslint, lint, log}) => {
				const executeOnFiles = eslint.CLIEngine.prototype.executeOnFiles.mockReturnValue(
					{
						results: [],
					}
				);

				await lint();

				expect(executeOnFiles).toBeCalledWith([
					'apps/segments/segments-web/src/index.es.js',
				]);

				// No errors or warnings, so no results.

				expect(log).toBeCalledWith('');
			});
		});

		it("calls ESLint's `executeOnFiles()` function and reports results", async () => {
			await run(async ({eslint, lint, log}) => {
				const executeOnFiles = eslint.CLIEngine.prototype.executeOnFiles.mockReturnValue(
					{
						results: [
							{
								filePath: '/fancy/test.js',
								messages: [
									{
										column: 10,
										line: 20,
										message: 'Avoid explosions.',
										ruleId: 'no-boom',
										severity: 2,
									},
								],
							},
						],
					}
				);

				await expect(lint()).rejects.toThrow();

				expect(executeOnFiles).toBeCalledWith([
					'apps/segments/segments-web/src/index.es.js',
				]);

				expect(log.mock.calls.length).toBe(1);
				expect(log.mock.calls[0].length).toBe(1);

				const logged = log.mock.calls[0][0];

				expect(logged).toContain('/fancy/test.js');

				// `isTTY` varies in different CI environments, so we use a
				// regex here to match in a color-agnostic way.

				expect(logged).toMatch(
					/20:10 {2}.*error.* {2}Avoid explosions. {2}no-boom/
				);

				expect(logged).toContain(
					'\u2716 1 problem (1 error, 0 warnings)'
				);
			});
		});
	});
});
