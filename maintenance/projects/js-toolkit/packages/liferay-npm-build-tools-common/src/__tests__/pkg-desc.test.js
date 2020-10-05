/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

import PkgDesc from '../pkg-desc';

it('constructs root package descriptors correctly', () => {
	const pkg = new PkgDesc('a-package', '1.0.0');

	expect(pkg.id).toBe(PkgDesc.ROOT_ID);
	expect(pkg.name).toBe('a-package');
	expect(pkg.version).toBe('1.0.0');
	expect(pkg.dir.toString()).toBe('.');
	expect(pkg.isRoot).toBe(true);
});

it('constructs forced root package descriptors correctly', () => {
	const pkg = new PkgDesc('a-package', '1.0.0', __dirname, true);

	expect(pkg.id).toBe(PkgDesc.ROOT_ID);
	expect(pkg.name).toBe('a-package');
	expect(pkg.version).toBe('1.0.0');
	expect(pkg.dir.toString()).toBe(
		`.${path.sep}${path.relative('.', __dirname)}`
	);
	expect(pkg.isRoot).toBe(true);
});

it('constructs non-root package descriptors correctly', () => {
	const pkg = new PkgDesc('a-package', '1.0.0', __dirname);

	expect(pkg.id).toBe('a-package@1.0.0');
	expect(pkg.name).toBe('a-package');
	expect(pkg.version).toBe('1.0.0');
	expect(pkg.dir.toString()).toBe(
		`.${path.sep}${path.relative('.', __dirname)}`
	);
	expect(pkg.isRoot).toBe(false);
});

it('clone works', () => {
	let pkg = new PkgDesc('a-package', '1.0.0', __dirname);

	const cloneDir = path.join(__dirname, '..');

	pkg = pkg.clone({dir: cloneDir});

	expect(pkg.id).toBe('a-package@1.0.0');
	expect(pkg.name).toBe('a-package');
	expect(pkg.version).toBe('1.0.0');
	expect(pkg.dir.toString()).toBe(
		`.${path.sep}${path.relative('.', cloneDir)}`
	);
	expect(pkg.isRoot).toBe(false);
});

it('isRoot works', () => {
	let pkg;

	pkg = new PkgDesc('a-package', '1.0.0');

	expect(pkg.isRoot).toBe(true);

	pkg = new PkgDesc('a-package', '1.0.0', '/tmp');

	expect(pkg.isRoot).toBe(false);
});
