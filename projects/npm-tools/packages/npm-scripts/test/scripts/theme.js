/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const os = require('os');
const path = require('path');

const spawnSync = require('../../src/utils/spawnSync');
const getFixturePath = require('../../support/getFixturePath');

jest.mock('../../src/utils/spawnSync');

// Use path.normalize to make tests behave uniformly on Linux and Windows.

const {normalize} = path;

const FIXTURES = getFixturePath('scripts', 'theme');

const MODULES = path.join(FIXTURES, 'modules');

const APPS = path.join(MODULES, 'apps');
const NODE_MODULES = path.join(MODULES, 'node_modules');
const FJORD = path.join(APPS, 'frontend-theme-fjord', 'frontend-theme-fjord');
const CLASSIC = path.join(APPS, 'frontend-theme', 'frontend-theme-classic');
const BAD = path.join(
	FIXTURES,
	'not',
	'the',
	'modules',
	'you',
	'are',
	'looking',
	'for'
);
const FRONTEND = path.join(APPS, 'frontend-theme');
const STYLED = path.join(
	FRONTEND,
	'frontend-theme-styled',
	'src',
	'main',
	'resources',
	'META-INF',
	'resources',
	'_styled'
);
const UNSTYLED = path.join(
	FRONTEND,
	'frontend-theme-unstyled',
	'src',
	'main',
	'resources',
	'META-INF',
	'resources',
	'_unstyled'
);

describe('scripts/theme.js', () => {
	let cwd;

	beforeEach(() => {
		cwd = process.cwd();
		jest.resetAllMocks();
	});

	afterEach(() => {
		process.chdir(cwd);
	});

	describe('checkExistingBuildArgs()', () => {
		let checkExistingBuildArgs;

		beforeEach(() => {
			({checkExistingBuildArgs} = require('../../src/scripts/theme'));
		});

		it('complains about --css-common-path', () => {
			expect(() => {
				checkExistingBuildArgs(['--css-common-path', '.']);
			}).toThrow(/Must not supply --css-common-path/);
		});

		it('complains about --styled-path', () => {
			expect(() => {
				checkExistingBuildArgs(['--styled-path', '.']);
			}).toThrow(/Must not supply --styled-path/);
		});

		it('complains about --unstyled-path', () => {
			expect(() => {
				checkExistingBuildArgs(['--unstyled-path', '.']);
			}).toThrow(/Must not supply --unstyled-path/);
		});

		it('complains about --sass-include-paths', () => {
			expect(() => {
				checkExistingBuildArgs(['--sass-include-paths', '.']);
			}).toThrow(/Must not supply --sass-include-paths/);
		});

		it('accepts other arguments', () => {
			expect(() => {
				checkExistingBuildArgs(['--verbose']);
			}).not.toThrow();
		});

		it('does not require existing arguments', () => {
			expect(() => {
				checkExistingBuildArgs([]);
			}).not.toThrow();
		});
	});

	describe('findModulesDirectory()', () => {
		let findModulesDirectory;

		beforeEach(() => {
			({findModulesDirectory} = require('../../src/scripts/theme'));
		});

		it('returns null when there is no "modules" ancestor', () => {
			expect(findModulesDirectory(os.tmpdir())).toBe(null);
		});

		it('returns the path when there is an "modules" ancestor', () => {
			expect(findModulesDirectory(CLASSIC)).toBe(MODULES);
			expect(findModulesDirectory(FJORD)).toBe(MODULES);
		});
	});

	describe('prepareAdditionalBuildArgs()', () => {
		let prepareAdditionalBuildArgs;

		beforeEach(() => {
			({prepareAdditionalBuildArgs} = require('../../src/scripts/theme'));
		});

		it('complains if there is no "modules" ancestor', () => {
			process.chdir(os.tmpdir());
			expect(() => prepareAdditionalBuildArgs()).toThrow(
				/Unable to find "modules"/
			);
		});

		it('complains if there is no "frontend-theme" directory', () => {
			process.chdir(BAD);
			expect(() => prepareAdditionalBuildArgs()).toThrow(
				/Unable to find "frontend-theme"/
			);
		});

		it('returns a set of build arguments (classic)', () => {
			process.chdir(CLASSIC);
			expect(prepareAdditionalBuildArgs()).toEqual([
				'--css-common-path',
				normalize('build_gradle/frontend-css-common'),
				'--sass-include-paths',
				NODE_MODULES,
				'--styled-path',
				STYLED,
				'--unstyled-path',
				UNSTYLED,
			]);
		});

		it('returns a set of build arguments (fjord)', () => {
			process.chdir(FJORD);
			expect(prepareAdditionalBuildArgs()).toEqual([
				'--css-common-path',
				normalize('build_gradle/frontend-css-common'),
				'--sass-include-paths',
				NODE_MODULES,
				'--styled-path',
				STYLED,
				'--unstyled-path',
				UNSTYLED,
			]);
		});
	});

	describe('run()', () => {
		let run;

		beforeEach(() => {
			({run} = require('../../src/scripts/theme'));
		});

		describe('build', () => {
			it('invokes gulp with custom arguments (classic)', () => {
				process.chdir(CLASSIC);
				run('build');
				expect(spawnSync).toHaveBeenCalledWith('gulp', [
					'build',
					'--css-common-path',
					normalize('build_gradle/frontend-css-common'),
					'--sass-include-paths',
					NODE_MODULES,
					'--styled-path',
					STYLED,
					'--unstyled-path',
					UNSTYLED,
				]);
			});

			it('invokes gulp with custom arguments (fjord)', () => {
				process.chdir(FJORD);
				run('build');
				expect(spawnSync).toHaveBeenCalledWith('gulp', [
					'build',
					'--css-common-path',
					normalize('build_gradle/frontend-css-common'),
					'--sass-include-paths',
					NODE_MODULES,
					'--styled-path',
					STYLED,
					'--unstyled-path',
					UNSTYLED,
				]);
			});

			it('complains if passed forbidden arguments', () => {
				process.chdir(CLASSIC);
				expect(() => run('build', '--css-common-path', '.')).toThrow(
					/Must not supply --css-common-path/
				);
			});

			it('accepts additional permitted arguments', () => {
				process.chdir(CLASSIC);
				expect(() => run('build', '--verbose', '.')).not.toThrow();
			});

			it('complains if there is no "modules" ancestor', () => {
				process.chdir(os.tmpdir());
				expect(() => run('build')).toThrow(/Unable to find "modules"/);
			});

			it('complains if called when there is no "frontend-theme"', () => {
				process.chdir(BAD);
				expect(() => run('build')).toThrow(
					/Unable to find "frontend-theme"/
				);
			});
		});

		describe('other tasks', () => {
			it('passes the arguments through unchanged', () => {
				run('help');
				expect(spawnSync).toHaveBeenCalledWith('gulp', ['help']);
			});
		});
	});
});
