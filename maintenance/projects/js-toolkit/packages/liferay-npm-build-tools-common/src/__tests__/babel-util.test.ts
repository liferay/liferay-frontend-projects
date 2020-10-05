/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

import * as babelUtil from '../babel-util';
import project from '../project';

const absPrjDirPath = path.join(__dirname, '__fixtures__', 'babel-util');

beforeAll(() => {
	project.loadFrom(absPrjDirPath);
});

describe('getModuleName', () => {
	it('works for source project module inside project.sources', () => {
		const name = babelUtil.getModuleName(
			path.join(absPrjDirPath, 'src', 'path', 'to', 'module.js')
		);

		expect(name).toEqual('babel-util@1.0.0/path/to/module');
	});

	it('works for source project module outside project.sources', () => {
		const name = babelUtil.getModuleName(
			path.join(absPrjDirPath, 'path', 'to', 'module.js')
		);

		expect(name).toEqual('babel-util@1.0.0/path/to/module');
	});

	it('works for source dependency module', () => {
		const name = babelUtil.getModuleName(
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
		const name = babelUtil.getModuleName(
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
		const name = babelUtil.getModuleName(
			path.join(absPrjDirPath, 'build', 'path', 'to', 'module.js')
		);

		expect(name).toEqual('babel-util@1.0.0/path/to/module');
	});

	it('works for build dependency module', () => {
		const name = babelUtil.getModuleName(
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
		const name = babelUtil.getModuleName(
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
	it('works for source project module', () => {
		const dir = babelUtil.getPackageDir(
			path.join(absPrjDirPath, 'path', 'to', 'module.js')
		);

		expect(dir).toEqual(absPrjDirPath);
	});

	it('works for source dependency module', () => {
		const pkgDir = path.join(absPrjDirPath, 'node_modules', 'a-package');
		const dir = babelUtil.getPackageDir(
			path.join(pkgDir, 'path', 'to', 'module.js')
		);

		expect(dir).toEqual(pkgDir);
	});

	it('works for source scoped dependency module', () => {
		const pkgDir = path.join(
			absPrjDirPath,
			'node_modules',
			'@a-scoped',
			'package'
		);
		const dir = babelUtil.getPackageDir(
			path.join(pkgDir, 'path', 'to', 'module.js')
		);

		expect(dir).toEqual(pkgDir);
	});

	it('works for build project module', () => {
		const pkgDir = path.join(absPrjDirPath, 'build');
		const dir = babelUtil.getPackageDir(
			path.join(pkgDir, 'path', 'to', 'module.js')
		);

		expect(dir).toEqual(pkgDir);
	});

	it('works for build dependency module', () => {
		const pkgDir = path.join(
			absPrjDirPath,
			'build',
			'node_modules',
			'a-package@1.0.0'
		);
		const dir = babelUtil.getPackageDir(
			path.join(pkgDir, 'path', 'to', 'module.js')
		);

		expect(dir).toEqual(pkgDir);
	});

	it('works for build scoped dependency module', () => {
		const pkgDir = path.join(
			absPrjDirPath,
			'build',
			'node_modules',
			'@a-scoped%2Fpackage@1.0.0'
		);
		const dir = babelUtil.getPackageDir(
			path.join(pkgDir, 'path', 'to', 'module.js')
		);

		expect(dir).toEqual(pkgDir);
	});
});
