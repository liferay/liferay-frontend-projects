/* eslint-disable @liferay/imports-first */
/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');
const path = require('path');

const findRoot = require('../../src/utils/findRoot');
const getFixturePath = require('../../support/getFixturePath');

const FIXTURES = getFixturePath('utils', 'buildArtifacts');
const MODULES = path.join(FIXTURES, 'modules');
const PUBLIC_PROJECT = path.join(MODULES, 'apps', 'some', 'project');

const CACHE_PATH = path.join(MODULES, '.npmscripts');
const MODULE_NAME = 'some-module';
const SRC_FILES = [path.join('src', 'index.js')];

jest.mock('../../src/utils/findRoot', () => jest.fn());

findRoot.mockImplementation(() => MODULES);

const buildFileDir = path.join(PUBLIC_PROJECT, 'build', 'packageRunBuild');
const srcFileDir = path.join(PUBLIC_PROJECT, 'src');

const buildFilePath = path.join(buildFileDir, 'index.js');
const srcFilePath = path.join(srcFileDir, 'index.js');

const setupFixtures = () => {
	if (!fs.existsSync(buildFileDir)) {
		fs.mkdirSync(buildFileDir, {recursive: true});
	}

	fs.writeFileSync(buildFilePath, 'module.exports = "build"');

	if (!fs.existsSync(srcFileDir)) {
		fs.mkdirSync(srcFileDir, {recursive: true});
	}

	fs.writeFileSync(srcFilePath, 'module.exports = "src"');
};

const tearDownFixtures = () => {
	fs.rmdirSync(buildFileDir, {recursive: true});
	fs.rmdirSync(srcFileDir, {recursive: true});
};

describe('caching build artifacts', () => {
	const cwd = process.cwd();

	process.chdir(PUBLIC_PROJECT);

	// In order for this test to work, this require must be inside the describe block
	// because it relies on the findRoot function to be mocked before importing

	const {isCacheValid, setCache} = require('../../src/utils/buildArtifacts');

	const setTestCache = () => {
		setCache(MODULE_NAME, SRC_FILES, 'build');
	};
	const clearTestCache = () => {
		if (fs.existsSync(CACHE_PATH)) {
			fs.rmdirSync(CACHE_PATH, {recursive: true});
		}
	};

	beforeEach(() => {
		setupFixtures();
	});

	afterEach(() => {
		clearTestCache();
		tearDownFixtures();
	});

	afterAll(() => {
		process.chdir(cwd);

		clearTestCache();
	});

	describe('set build cache', () => {
		it('stores build artifacts in cache', () => {
			setTestCache();

			expect(
				fs.existsSync(
					path.join(CACHE_PATH, 'build', 'artifacts', MODULE_NAME)
				)
			).toBe(true);

			const buildInfoJson = JSON.parse(
				fs.readFileSync(
					path.join(
						CACHE_PATH,
						'build',
						'artifacts',
						MODULE_NAME,
						'buildinfo.json'
					),
					'utf8'
				)
			);

			expect(Object.values(buildInfoJson.srcFiles))
				.toMatchInlineSnapshot(`
			Array [
			  "b4258b676ee9dc8cbe9adbbbc1bb56efa11aa984",
			]
		`);
			expect(Object.values(buildInfoJson.builtFiles))
				.toMatchInlineSnapshot(`
			Array [
			  "ee45f3714a404c5b444eae7cb0d68141389cf331",
			]
		`);

			expect(
				fs.readFileSync(
					path.join(
						CACHE_PATH,
						'build',
						'artifacts',
						MODULE_NAME,
						'build',
						'packageRunBuild',
						'index.js'
					)
				)
			).toEqual(
				fs.readFileSync(
					path.join(
						PUBLIC_PROJECT,
						'build',
						'packageRunBuild',
						'index.js'
					)
				)
			);
		});
	});

	describe('checks if cache is valid', () => {
		it('returns false if no build info exists', () => {
			expect(isCacheValid(MODULE_NAME, SRC_FILES)).toBe(false);
		});

		it('returns false if build info is malformed', () => {
			const buildInfoPath = path.join(
				CACHE_PATH,
				'build',
				'artifacts',
				MODULE_NAME,
				'buildinfo.json'
			);

			fs.mkdirSync(path.dirname(buildInfoPath), {recursive: true});

			fs.writeFileSync(buildInfoPath, '{');

			expect(isCacheValid(MODULE_NAME, SRC_FILES)).toBe(false);

			fs.rmdirSync(CACHE_PATH, {recursive: true});
		});

		it('returns false if number or source files changed', () => {
			setTestCache();

			expect(isCacheValid(MODULE_NAME, [...SRC_FILES, 'foo/nar'])).toBe(
				false
			);
		});

		it('returns false if content of source file changes', () => {
			setTestCache();

			expect(isCacheValid(MODULE_NAME, SRC_FILES)).toBe(true);

			const prevContent = fs.readFileSync(SRC_FILES[0], 'utf8');

			fs.writeFileSync(SRC_FILES[0], 'test');

			expect(isCacheValid(MODULE_NAME, SRC_FILES)).toBe(false);

			fs.writeFileSync(SRC_FILES[0], prevContent);
		});

		it("checks if build file doesn't exist then copy previous build from cache", () => {
			setTestCache();

			const builtFilePath = path.join(
				PUBLIC_PROJECT,
				'build',
				'packageRunBuild',
				'index.js'
			);
			const builtFileContent = fs.readFileSync(builtFilePath, 'utf8');

			fs.rmdirSync(
				path.join(PUBLIC_PROJECT, 'build', 'packageRunBuild'),
				{recursive: true}
			);

			expect(fs.existsSync(builtFilePath)).toBe(false);

			expect(isCacheValid(MODULE_NAME, SRC_FILES)).toBe(true);

			expect(fs.existsSync(builtFilePath)).toBe(true);

			expect(fs.readFileSync(builtFilePath, 'utf8')).toBe(
				builtFileContent
			);
		});

		it('checks if build file is different from cache and restores cached version', () => {
			setTestCache();

			const builtFilePath = path.join(
				PUBLIC_PROJECT,
				'build',
				'packageRunBuild',
				'index.js'
			);

			const cacheFilePath = path.join(
				CACHE_PATH,
				'build',
				'artifacts',
				MODULE_NAME,
				'build',
				'packageRunBuild',
				'index.js'
			);

			const builtFileContent = fs.readFileSync(builtFilePath, 'utf8');
			const cacheFileContent = fs.readFileSync(cacheFilePath, 'utf8');

			expect(isCacheValid(MODULE_NAME, SRC_FILES)).toBe(true);
			expect(builtFileContent).toBe(cacheFileContent);

			fs.writeFileSync(builtFilePath, 'changed');

			expect(isCacheValid(MODULE_NAME, SRC_FILES)).toBe(true);

			const newBuiltFileContent = fs.readFileSync(builtFilePath, 'utf8');

			expect(newBuiltFileContent).toBe(cacheFileContent);
		});
	});
});
