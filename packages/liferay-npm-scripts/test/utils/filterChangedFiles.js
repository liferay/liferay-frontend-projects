/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {randomBytes} = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const filterChangedFiles = require('../../src/utils/filterChangedFiles');
const git = require('../../src/utils/git');

const TMP_DIR = os.tmpdir();

const join = path.posix.join;

describe('filterChangedFiles()', () => {
	let branch;
	let cwd;
	let files;
	let pkg;
	let privatePkg;

	beforeAll(() => {
		cwd = process.cwd();
		branch = process.env.LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME;

		// Set up a Git repo with the following history:
		//
		//      * (master, HEAD) l
		//      | * (topic-2) k (touches nothing)
		//      | * j (updates liferay-npm-scripts in private)
		//      | * i (touches private package.json but no update)
		//      | * h (touches a source file)
		//      |/
		//      * g (updates scripts in both places)
		//      | * (topic-1) f (touches nothing)
		//      | * e (updates liferay-npm-scripts at top-level)
		//      | * d (touches top-level package.json but no update)
		//      | * c (touches a source file)
		//      |/
		//      * b (touches nothing)
		//      * a (root commit)
		//
		const repo = join(
			TMP_DIR,
			`liferay-npm-scripts-${randomBytes(16).toString('hex')}`
		);

		fs.mkdirSync(repo);

		process.chdir(repo);

		git('init');

		fs.mkdirSync(join('modules', 'private'), {recursive: true});

		pkg = join('modules', 'package.json');
		privatePkg = join('modules', 'private', 'package.json');

		fs.writeFileSync('a', 'stuff\n', 'utf8');
		fs.writeFileSync(pkg, 'liferay-npm-scripts: 1\n', 'utf8');
		fs.writeFileSync(privatePkg, 'liferay-npm-scripts: 1\n', 'utf8');

		git('add', 'a', 'modules');
		git('commit', '-m', 'a', '--', 'a', 'modules');
		git('tag', 'a');
		git('commit', '-m', 'b', '--allow-empty');
		git('tag', 'b');
		git('checkout', '-b', 'topic-1');

		fs.writeFileSync('a', 'different stuff\n', {
			encoding: 'utf8',
			flag: 'a',
		});

		git('commit', '-m', 'c', '--', 'a');
		git('tag', 'c');

		fs.writeFileSync(pkg, 'extra: 1\n', {encoding: 'utf8', flag: 'a'});

		git('commit', '-m', 'd', '--', pkg);
		git('tag', 'd');

		fs.writeFileSync(pkg, 'liferay-npm-scripts: 2\nextra: 1\n', 'utf8');

		git('commit', '-m', 'e', '--', pkg);
		git('tag', 'e');
		git('commit', '-m', 'f', '--allow-empty');
		git('tag', 'f');
		git('checkout', 'master');

		fs.writeFileSync(pkg, 'liferay-npm-scripts: 2\n', 'utf8');
		fs.writeFileSync(privatePkg, 'liferay-npm-scripts: 2\n', 'utf8');

		git('commit', '-m', 'g', '--', 'modules');
		git('tag', 'g');
		git('checkout', '-b', 'topic-2');

		fs.writeFileSync('a', 'more stuff\n', {encoding: 'utf8', flag: 'a'});

		git('commit', '-m', 'h', '--', 'a');
		git('tag', 'h');

		fs.writeFileSync(privatePkg, 'extra: 1\n', {
			encoding: 'utf8',
			flag: 'a',
		});

		git('commit', '-m', 'i', '--', privatePkg);
		git('tag', 'i');

		fs.writeFileSync(
			privatePkg,
			'liferay-npm-scripts: 3\nextra: 1\n',
			'utf8'
		);

		git('commit', '-m', 'j', '--', privatePkg);
		git('tag', 'j');
		git('commit', '-m', 'k', '--allow-empty');
		git('tag', 'k');
		git('checkout', 'master');
		git('commit', '-m', 'l', '--allow-empty');
		git('tag', 'l');

		files = git('ls-tree', '--name-only', '-r', 'HEAD').split('\n');
	});

	afterAll(() => {
		process.chdir(cwd);
		process.env.LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME = branch;
	});

	it('has a test repo that it can use (sanity check)', () => {
		expect(files.length).toBe(3);
	});

	describe('when LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME is not set', () => {
		it('returns all files', () => {
			expect(filterChangedFiles(files)).toEqual(files);
		});
	});

	describe('when LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME is set', () => {
		beforeEach(() => {
			process.env.LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME = 'master';
		});

		it('returns only changed files, unless it detects a liferay-npm-scripts update', () => {
			// Top-level.
			git('checkout', '--detach', 'c');
			expect(filterChangedFiles(files)).toEqual(['a']);

			git('checkout', '--detach', 'd');
			expect(filterChangedFiles(files)).toEqual(['a', pkg]);

			git('checkout', '--detach', 'e');
			expect(filterChangedFiles(files)).toEqual(files);

			// Private.
			git('checkout', '--detach', 'h');
			expect(filterChangedFiles(files)).toEqual(['a']);

			git('checkout', '--detach', 'i');
			expect(filterChangedFiles(files)).toEqual(['a', privatePkg]);

			git('checkout', '--detach', 'j');
			expect(filterChangedFiles(files)).toEqual(files);
		});
	});
});
