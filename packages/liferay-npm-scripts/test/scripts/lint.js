/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');

const FIXTURES = path.resolve(__dirname, '../../__fixtures__/scripts/lint');
const MODULES = path.join(FIXTURES, 'modules');

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
	function run(callback) {
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
			globs = ['**/*.jsp'];
		});

		it('logs a message', () => {
			run(({lint, log}) => {
				lint();

				expect(log).toBeCalledWith(
					expect.stringContaining('No globs applicable')
				);
			});
		});

		it('does not spawn "eslint"', () => {
			run(({eslint, lint}) => {
				lint();

				expect(
					eslint.CLIEngine.prototype.executeOnFiles
				).not.toBeCalled();
			});
		});
	});

	describe('when running from the top-level "modules/"  directory', () => {
		beforeEach(() => {
			process.chdir(MODULES);
		});

		it('spawns "eslint" and prints a report', () => {
			run(({eslint, lint, log}) => {
				eslint.CLIEngine.prototype.getFormatter.mockReturnValue(
					() => 'report...'
				);

				const executeOnFiles = eslint.CLIEngine.prototype.executeOnFiles.mockReturnValue(
					() => {
						return {
							results: []
						};
					}
				);

				lint();

				expect(executeOnFiles).toBeCalledWith([
					'apps/segments/segments-web/src/index.es.js'
				]);

				// This is the report from ESLint's formatter.
				expect(log).toBeCalledWith('report...');

				// This is our summary line.
				expect(log).toBeCalledWith(
					expect.stringContaining('ESLint checked 1 file')
				);
			});
		});
	});
});
