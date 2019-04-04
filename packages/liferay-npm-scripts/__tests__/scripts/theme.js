/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: BSD-3-Clause
 */

const os = require('os');
const path = require('path');

const FIXTURES = path.resolve(__dirname, '../../__fixtures__/scripts/theme');
const APPS = path.join(FIXTURES, 'modules/apps');
const FJORD = path.join(APPS, 'frontend-theme-fjord/frontend-theme-fjord');
const CLASSIC = path.join(APPS, 'frontend-theme/frontend-theme-classic');
const BAD = path.join(FIXTURES, 'not/the/apps/you/are/looking/for');
const FRONTEND = path.join(APPS, 'frontend-theme');
const STYLED = path.join(
	FRONTEND,
	'frontend-theme-styled/src/main/resources/META-INF/resources/_styled'
);
const UNSTYLED = path.join(
	FRONTEND,
	'frontend-theme-unstyled/src/main/resources/META-INF/resources/_unstyled'
);

describe('scripts/theme.js', () => {
	let cwd;
	let spawnSync;

	beforeEach(() => {
		cwd = process.cwd();
		jest.mock('../../src/utils/spawnSync');
		spawnSync = require('../../src/utils/spawnSync');
	});

	afterEach(() => {
		jest.resetModules();
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

	describe('findAppsDirectory()', () => {
		let findAppsDirectory;

		beforeEach(() => {
			({findAppsDirectory} = require('../../src/scripts/theme'));
		});

		it('returns null when there is no "apps" ancestor', () => {
			expect(findAppsDirectory(os.tmpdir())).toBe(null);
		});

		it('returns the path when there is an "apps" ancestor', () => {
			expect(findAppsDirectory(CLASSIC)).toBe(APPS);
			expect(findAppsDirectory(FJORD)).toBe(APPS);
		});
	});

	describe('prepareAdditionalBuildArgs()', () => {
		let prepareAdditionalBuildArgs;

		beforeEach(() => {
			({prepareAdditionalBuildArgs} = require('../../src/scripts/theme'));
		});

		it('complains if there is no "apps" ancestor', () => {
			process.chdir(os.tmpdir());
			expect(() => prepareAdditionalBuildArgs()).toThrow(
				/Unable to find "apps"/
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
				'./build_gradle/frontend-css-common',
				'--styled-path',
				STYLED,
				'--unstyled-path',
				UNSTYLED
			]);
		});

		it('returns a set of build arguments (fjord)', () => {
			process.chdir(FJORD);
			expect(prepareAdditionalBuildArgs()).toEqual([
				'--css-common-path',
				'./build_gradle/frontend-css-common',
				'--styled-path',
				STYLED,
				'--unstyled-path',
				UNSTYLED
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
					'./build_gradle/frontend-css-common',
					'--styled-path',
					STYLED,
					'--unstyled-path',
					UNSTYLED
				]);
			});

			it('invokes gulp with custom arguments (fjord)', () => {
				process.chdir(FJORD);
				run('build');
				expect(spawnSync).toHaveBeenCalledWith('gulp', [
					'build',
					'--css-common-path',
					'./build_gradle/frontend-css-common',
					'--styled-path',
					STYLED,
					'--unstyled-path',
					UNSTYLED
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

			it('complains if there is no "apps" ancestor', () => {
				process.chdir(os.tmpdir());
				expect(() => run('build')).toThrow(/Unable to find "apps"/);
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
