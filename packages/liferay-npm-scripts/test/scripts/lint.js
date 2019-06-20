/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

/**
 * Allow "." in regular expressions to match newlines.
 */
const DOT_ALL = 's';

/**
 * Allow "^" and "$" in regular expressions to match at line
 * boundaries instead of just the beginning and end of the string.
 */
const MULTILINE = 'm';

const FIXTURES = path.resolve(__dirname, '../../__fixtures__/scripts/lint');
const MODULES = path.join(FIXTURES, 'modules');
const FRONTEND_JS_WEB = path.join(MODULES, 'apps/frontend-js/frontend-js-web');
const SEGMENTS_WEB = path.join(MODULES, 'apps/segments/segments-web');
const ROGUE_PROJECT = path.join(MODULES, 'apps/rogue/project');
const NON_PROJECT = path.join(FIXTURES, 'somewhere/subtree/with/a/lock/file');

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
			jest.mock('../../src/utils/log');
			jest.mock('../../src/utils/spawnSync');

			// Use [] here to avoid unwanted hoisting by
			// babel-plugin-jest-hoist.
			jest['mock']('../../src/utils/getMergedConfig', () => {
				return () => {
					return globs;
				};
			});

			const lint = require('../../src/scripts/lint');
			const log = require('../../src/utils/log');
			const spawnSync = require('../../src/utils/spawnSync');

			callback({lint, log, spawnSync});
		});
	}

	/**
	 * Helper to extract an argument that was passed to a mock `spawnSync` call.
	 */
	function get(mock, optionName) {
		expect(mock.mock.calls.length).toBe(1);

		const call = mock.mock.calls[0];
		const [command, args] = call;

		expect(command).toBe('eslint');

		const index = args.indexOf(optionName);

		expect(index).not.toBe(-1);
		expect(args.length).toBeGreaterThan(index + 1);

		return args[index + 1];
	}

	/**
	 * Helper to read the contents of the generated `--ignore-path` file.
	 */
	function getIgnores() {
		let contents;

		run(({lint, spawnSync}) => {
			lint();

			const ignore = get(spawnSync, '--ignore-path');

			contents = fs.readFileSync(ignore).toString();
		});

		return contents;
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
			run(({lint, spawnSync}) => {
				lint();

				expect(spawnSync).not.toBeCalled();
			});
		});
	});

	describe('when running from the top-level "modules/"  directory', () => {
		beforeEach(() => {
			process.chdir(MODULES);
		});

		it('spawns "eslint"', () => {
			run(({lint, spawnSync}) => {
				lint();

				expect(spawnSync).toBeCalledWith('eslint', expect.any(Array));
			});
		});

		describe('combining all .eslintignore files together', () => {
			let contents;

			beforeEach(() => {
				contents = getIgnores();
			});

			it('concatenates the files in order', () => {
				expect(contents).toMatch(
					new RegExp(
						[
							'This is the top-level',
							'A project-level \\.eslintignore',
							'Another project-level \\.eslintignore'
						].join('.+'),
						DOT_ALL
					)
				);
			});

			it('relativizes project-specific patterns', () => {
				expect(contents).toMatch(
					new RegExp(
						'^/apps/segments/segments-web/\\*\\*/legacy/\\*$',
						MULTILINE
					)
				);
			});

			it('preserves negation prefix in project-specific patterns', () => {
				expect(contents).toMatch(
					new RegExp(
						'^!/apps/segments/segments-web/src/stuff/\\*\\.js$',
						MULTILINE
					)
				);
			});
		});
	});

	describe('when running from a project without an .eslintignore', () => {
		let contents;

		beforeEach(() => {
			process.chdir(FRONTEND_JS_WEB);

			contents = getIgnores();
		});

		it('uses the top-level .eslintignore', () => {
			expect(contents).toContain('This is the top-level');
		});

		it('does not include .eslintignore patterns from other projects', () => {
			expect(contents).not.toContain('project-level .eslintignore');
		});
	});

	describe('when running from a project with an .eslintignore', () => {
		let contents;

		beforeEach(() => {
			process.chdir(SEGMENTS_WEB);

			contents = getIgnores();
		});

		it('concatenates the top-level and project-level patterns', () => {
			expect(contents).toMatch(
				new RegExp(
					[
						'This is the top-level',
						'Another project-level \\.eslintignore'
					].join('.+'),
					DOT_ALL
				)
			);
		});

		it('does not include .eslintignore patterns from other projects', () => {
			expect(contents).not.toContain('A project-level .eslintignore');
		});

		it('does not relativize project-specific patterns', () => {
			expect(contents).toMatch(
				new RegExp('^\\*\\*/legacy/\\*$', MULTILINE)
			);
		});
	});

	describe('when running from a project with a local yarn.lock', () => {
		// We're not supposed to have any projects like this, but we want to
		// test to prove that our detection of the top-level "modules/" folder
		// isn't fooled by a "yarn.lock" in an unexpected location.

		beforeEach(() => {
			process.chdir(ROGUE_PROJECT);
		});

		it('still correctly finds the .eslintignore in the top-level', () => {
			const contents = getIgnores();

			expect(contents).toContain('This is the top-level');
		});

		it('logs a message about the unexpected yarn.lock', () => {
			run(({lint, log}) => {
				lint();

				expect(log).toBeCalledWith(
					expect.stringMatching(
						new RegExp(
							[
								'Found a yarn\\.lock',
								'but it is not the "modules/" root'
							].join('.+')
						)
					)
				);
			});
		});
	});

	describe('when running outside of the top-level "modules/" directory', () => {
		// Again, this isn't supposed to happen, but we want to test that we
		// don't get fooled by the presence of a "yarn.lock" in an unexpected
		// location.

		beforeEach(() => {
			process.chdir(NON_PROJECT);
		});

		it('logs a message about missing top-level "modules/" directory', () => {
			run(({lint, log}) => {
				lint();

				expect(log).toBeCalledWith(
					expect.stringContaining('Unable to find "modules/" root')
				);
			});
		});

		it('uses creates and uses an empty .eslintignore', () => {
			const contents = getIgnores();

			expect(contents).toBe('');
		});
	});
});
