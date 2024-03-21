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
	let repo;

	const getFiles = () =>
		git('ls-tree', '--name-only', '-r', '-z', 'HEAD')
			.split('\0')
			.filter(Boolean);

	beforeAll(() => {
		cwd = process.cwd();
		branch = process.env.LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME;

		// Set up a Git repo with the following history:
		//
		//      * (master, HEAD) l
		//      |
		//      | * (topic-2) k (touches nothing)
		//      | * j (updates @liferay/npm-scripts in private)
		//      | * i (touches private package.json but no update)
		//      | * h (touches a source file)
		//      |/
		//      * g (updates scripts in both places)
		//      |
		//      | * (topic-1) f (touches nothing)
		//      | * e (updates @liferay/npm-scripts at top-level)
		//      | * d (touches top-level package.json but no update)
		//      | * c (touches a source file)
		//      |/
		//      * b (touches nothing)
		//      * a (root commit)
		//

		repo = join(
			TMP_DIR,
			`liferay-npm-scripts-${randomBytes(16).toString('hex')}`
		);

		fs.mkdirSync(repo);

		process.chdir(repo);

		git('init', '--initial-branch', 'master');
		git('config', 'user.email', 'ci@example.net');
		git('config', 'user.name', 'Continuous Integration');

		fs.mkdirSync(join('modules', 'private'), {recursive: true});

		const code = join('modules', 'code');
		const nested = join('modules', 'private', 'nested');
		const other = join('modules', 'other');
		const pkg = join('modules', 'package.json');
		const privatePkg = join('modules', 'private', 'package.json');

		fs.writeFileSync(code, 'stuff\n', 'utf8');
		fs.writeFileSync(nested, 'nested\n', 'utf8');
		fs.writeFileSync(other, 'other\n', 'utf8');
		fs.writeFileSync(pkg, '@liferay/npm-scripts: 1\n', 'utf8');
		fs.writeFileSync(privatePkg, '@liferay/npm-scripts: 1\n', 'utf8');

		git('add', 'modules');
		git('commit', '-m', 'a', '--', 'modules');
		git('tag', 'a');
		git('commit', '-m', 'b', '--allow-empty');
		git('tag', 'b');
		git('checkout', '-b', 'topic-1');

		fs.writeFileSync(code, 'different stuff\n', {
			encoding: 'utf8',
			flag: 'a',
		});

		git('commit', '-m', 'c', '--', code);
		git('tag', 'c');

		fs.writeFileSync(pkg, 'extra: 1\n', {encoding: 'utf8', flag: 'a'});

		git('commit', '-m', 'd', '--', pkg);
		git('tag', 'd');

		fs.writeFileSync(pkg, '@liferay/npm-scripts: 2\nextra: 1\n', 'utf8');

		git('commit', '-m', 'e', '--', pkg);
		git('tag', 'e');
		git('commit', '-m', 'f', '--allow-empty');
		git('tag', 'f');
		git('checkout', 'master');

		fs.writeFileSync(pkg, '@liferay/npm-scripts: 2\n', 'utf8');
		fs.writeFileSync(privatePkg, '@liferay/npm-scripts: 2\n', 'utf8');

		git('commit', '-m', 'g', '--', 'modules');
		git('tag', 'g');
		git('checkout', '-b', 'topic-2');

		fs.writeFileSync(code, 'more stuff\n', {encoding: 'utf8', flag: 'a'});

		git('commit', '-m', 'h', '--', code);
		git('tag', 'h');

		fs.writeFileSync(privatePkg, 'extra: 1\n', {
			encoding: 'utf8',
			flag: 'a',
		});

		git('commit', '-m', 'i', '--', privatePkg);
		git('tag', 'i');

		fs.writeFileSync(
			privatePkg,
			'@liferay/npm-scripts: 3\nextra: 1\n',
			'utf8'
		);

		git('commit', '-m', 'j', '--', privatePkg);
		git('tag', 'j');
		git('commit', '-m', 'k', '--allow-empty');
		git('tag', 'k');
		git('checkout', 'master');
		git('commit', '-m', 'l', '--allow-empty');
		git('tag', 'l');
	});

	beforeEach(() => {
		process.chdir(join(repo, 'modules'));
	});

	afterAll(() => {
		process.chdir(cwd);
		process.env.LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME = branch;
	});

	it('has a test repo that it can use (sanity check)', () => {
		expect(getFiles()).toEqual([
			'code',
			'other',
			'package.json',
			'private/nested',
			'private/package.json',
		]);
	});

	describe('when LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME is not set', () => {
		it('returns all files', () => {
			const files = getFiles();

			expect(filterChangedFiles(files)).toEqual(files);
		});
	});

	describe('when LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME is set', () => {
		beforeEach(() => {
			process.env.LIFERAY_NPM_SCRIPTS_WORKING_BRANCH_NAME = 'master';
		});

		it('returns only changed files, unless it detects a @liferay/npm-scripts update', () => {

			// Top-level.

			let files = getFiles();

			git('checkout', '--detach', 'c');
			expect(filterChangedFiles(files)).toEqual(['code']);

			git('checkout', '--detach', 'd');
			expect(filterChangedFiles(files)).toEqual(['code', 'package.json']);

			git('checkout', '--detach', 'e');
			expect(filterChangedFiles(files)).toEqual([
				'code',
				'other',
				'package.json',
				'private/nested',
				'private/package.json',
			]);

			// Private.

			process.chdir('private');

			files = getFiles();

			git('checkout', '--detach', 'h');
			expect(filterChangedFiles(files)).toEqual([]);

			git('checkout', '--detach', 'i');
			expect(filterChangedFiles(files)).toEqual(['package.json']);

			git('checkout', '--detach', 'j');
			expect(filterChangedFiles(files)).toEqual([
				'nested',
				'package.json',
			]);
		});
	});
});
