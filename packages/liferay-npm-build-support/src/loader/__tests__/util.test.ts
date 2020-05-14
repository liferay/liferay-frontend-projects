/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

import {project} from '../../config';
import {getModuleName, getPackageDir, removeWebpackHash} from '../util';

const absPrjDirPath = path.join(__dirname, '__fixtures__', 'a-project');

describe('getModuleName', () => {
	beforeAll(() => {
		project.loadFrom(absPrjDirPath);
	});

	it('works for source project module inside project.sources', () => {
		const name = getModuleName(
			path.join(absPrjDirPath, 'src', 'path', 'to', 'module.js')
		);

		expect(name).toEqual('a-project@1.0.0/path/to/module');
	});

	it('works for source project module outside project.sources', () => {
		const name = getModuleName(
			path.join(absPrjDirPath, 'path', 'to', 'module.js')
		);

		expect(name).toEqual('a-project@1.0.0/path/to/module');
	});

	it('works for source dependency module', () => {
		const name = getModuleName(
			path.join(
				absPrjDirPath,
				'node_modules',
				'a-package',
				'path',
				'to',
				'module.js'
			)
		);

		expect(name).toEqual('a-package@1.0.0/path/to/module');
	});

	it('works for source scoped dependency module', () => {
		const name = getModuleName(
			path.join(
				absPrjDirPath,
				'node_modules',
				'@a-scoped',
				'package',
				'path',
				'to',
				'module.js'
			)
		);

		expect(name).toEqual('@a-scoped/package@1.0.0/path/to/module');
	});

	it('works for build project module', () => {
		const name = getModuleName(
			path.join(absPrjDirPath, 'build', 'path', 'to', 'module.js')
		);

		expect(name).toEqual('a-project@1.0.0/path/to/module');
	});

	it('works for build dependency module', () => {
		const name = getModuleName(
			path.join(
				absPrjDirPath,
				'build',
				'node_modules',
				'a-package@1.0.0',
				'path',
				'to',
				'module.js'
			)
		);

		expect(name).toEqual('a-package@1.0.0/path/to/module');
	});

	it('works for build scoped dependency module', () => {
		const name = getModuleName(
			path.join(
				absPrjDirPath,
				'build',
				'node_modules',
				'@a-scoped%2Fpackage@1.0.0',
				'path',
				'to',
				'module.js'
			)
		);

		expect(name).toEqual('@a-scoped/package@1.0.0/path/to/module');
	});
});

describe('getPackageDir', () => {
	beforeAll(() => {
		project.loadFrom(absPrjDirPath);
	});

	it('works for source project module', () => {
		const dir = getPackageDir(
			path.join(absPrjDirPath, 'path', 'to', 'module.js')
		);

		expect(dir).toEqual(absPrjDirPath);
	});

	it('works for source dependency module', () => {
		const pkgDir = path.join(absPrjDirPath, 'node_modules', 'a-package');
		const dir = getPackageDir(path.join(pkgDir, 'path', 'to', 'module.js'));

		expect(dir).toEqual(pkgDir);
	});

	it('works for source scoped dependency module', () => {
		const pkgDir = path.join(
			absPrjDirPath,
			'node_modules',
			'@a-scoped',
			'package'
		);
		const dir = getPackageDir(path.join(pkgDir, 'path', 'to', 'module.js'));

		expect(dir).toEqual(pkgDir);
	});

	it('works for build project module', () => {
		const pkgDir = path.join(absPrjDirPath, 'build');
		const dir = getPackageDir(path.join(pkgDir, 'path', 'to', 'module.js'));

		expect(dir).toEqual(pkgDir);
	});

	it('works for build dependency module', () => {
		const pkgDir = path.join(
			absPrjDirPath,
			'build',
			'node_modules',
			'a-package@1.0.0'
		);
		const dir = getPackageDir(path.join(pkgDir, 'path', 'to', 'module.js'));

		expect(dir).toEqual(pkgDir);
	});

	it('works for build scoped dependency module', () => {
		const pkgDir = path.join(
			absPrjDirPath,
			'build',
			'node_modules',
			'@a-scoped%2Fpackage@1.0.0'
		);
		const dir = getPackageDir(path.join(pkgDir, 'path', 'to', 'module.js'));

		expect(dir).toEqual(pkgDir);
	});
});

describe('removeWebpackHash', () => {
	it('works when hash is the first part', () => {
		expect(removeWebpackHash('4d4306b3.file.js')).toBe('file.js');
	});

	it('works when hash is a middle part', () => {
		expect(removeWebpackHash('this.is.a.4d4306b3.file.js')).toBe(
			'this.is.a.file.js'
		);
	});

	it('works when hash is the last part before the extension', () => {
		expect(removeWebpackHash('a.file.4d4306b3.js')).toBe('a.file.js');
	});

	it('works when hash is the very last part', () => {
		expect(removeWebpackHash('a.file.4d4306b3')).toBe('a.file');
	});

	it('removes just the last hash', () => {
		expect(removeWebpackHash('a.fabada.4d4306b3.js')).toBe('a.fabada.js');
	});
});
