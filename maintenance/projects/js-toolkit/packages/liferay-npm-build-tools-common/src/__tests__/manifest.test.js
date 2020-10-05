/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import PkgDesc from 'liferay-npm-build-tools-common/lib/pkg-desc';
import path from 'path';

import Manifest from '../manifest';

it('addPackage/getPackage work', () => {
	const manifest = new Manifest();

	const srcPkg = new PkgDesc('a-package', '1.0.0', './src');
	const destPkg = new PkgDesc('a-package', '1.0.0', './dest');

	manifest.addPackage(srcPkg, destPkg);

	expect(manifest.getPackage(srcPkg)).toMatchSnapshot();
});

it('getPackage returns entries with relative paths', () => {
	const manifest = new Manifest();

	const srcPkg = new PkgDesc('a-package', '1.0.0', path.resolve('./src'));
	const destPkg = new PkgDesc('a-package', '1.0.0', path.resolve('./dest'));

	manifest.addPackage(srcPkg, destPkg);

	const entry = manifest.getPackage(srcPkg);

	expect(entry.src.dir).toBe('./src');
	expect(entry.dest.dir).toBe('./dest');
});

describe('save', () => {
	it('works', () => {
		const manifest = new Manifest();

		const srcPkg1 = new PkgDesc('a-package', '1.0.0', './src-1');
		const destPkg1 = new PkgDesc('a-package', '1.0.0', './dest-1');

		const srcPkg2 = new PkgDesc('a-package', '2.0.0', './src-2');
		const destPkg2 = new PkgDesc('a-package', '2.0.0', './dest-2');

		manifest.addPackage(srcPkg1, destPkg1);
		manifest.addPackage(srcPkg2, destPkg2);

		const tmpDir = fs.mkdtempSync('manifest');
		const tmpFilePath = path.join(tmpDir, 'manifest.json');

		manifest.save(tmpFilePath);

		expect(fs.readFileSync(tmpFilePath).toString()).toMatchSnapshot();

		fs.unlinkSync(tmpFilePath);
		fs.rmdirSync(tmpDir);
	});

	it('throws if called with no path and no default file path is set', () => {
		const manifest = new Manifest();

		expect(() => manifest.save()).toThrow();
	});
});

it('constructor with file works', () => {
	const tmpDir = fs.mkdtempSync('manifest');
	const tmpFilePath = path.join(tmpDir, 'manifest.json');

	const manifest = new Manifest(tmpFilePath);

	const srcPkg1 = new PkgDesc('a-package', '1.0.0', './src-1');
	const destPkg1 = new PkgDesc('a-package', '1.0.0', './dest-1');

	const srcPkg2 = new PkgDesc('a-package', '2.0.0', './src-2');
	const destPkg2 = new PkgDesc('a-package', '2.0.0', './dest-2');

	manifest.addPackage(srcPkg1, destPkg1);
	manifest.addPackage(srcPkg2, destPkg2);

	manifest.save();

	const manifest2 = new Manifest(tmpFilePath);

	expect(manifest2.toJSON()).toMatchSnapshot();

	fs.unlinkSync(tmpFilePath);
	fs.rmdirSync(tmpDir);
});

describe('isOutdated', () => {
	it('returns false for up-to-date packages', () => {
		const manifest = new Manifest();

		const srcPkg = new PkgDesc('a-package', '1.0.0', './src');
		const destPkg = new PkgDesc('a-package', '1.0.0', '.');

		manifest.addPackage(srcPkg, destPkg);

		expect(manifest.isOutdated(srcPkg)).toBe(false);
	});

	// TODO: This test can be removed if we implement enhanced outdated detection by using timestamps/digests.
	// However, we are not sure that it is the bundler's responsibility to detect such modifications as it is
	// more a multi-tool build issue that may happen with other configurations.
	it('returns true for root package no matter what', () => {
		const manifest = new Manifest();

		const srcPkg = new PkgDesc('a-package', '1.0.0', './src', true);
		const destPkg = new PkgDesc('a-package', '1.0.0', '.', true);

		manifest.addPackage(srcPkg, destPkg);

		expect(manifest.isOutdated(srcPkg)).toBe(true);
	});

	it('returns true for unregistered packages', () => {
		const manifest = new Manifest();

		const srcPkg = new PkgDesc('a-package', '1.0.0', './src');

		expect(manifest.isOutdated(srcPkg)).toBe(true);
	});

	it('returns true for packages with missing destination directory', () => {
		const manifest = new Manifest();

		const srcPkg = new PkgDesc('a-package', '1.0.0', './src');
		const destPkg = new PkgDesc('a-package', '1.0.0', './non-existing-dir');

		manifest.addPackage(srcPkg, destPkg);

		expect(manifest.isOutdated(srcPkg)).toBe(true);
	});
});

describe('toJSON', () => {
	it('sorts keys alphabetically', () => {
		const manifest = new Manifest();

		const srcPkg1 = new PkgDesc('a-package', '1.0.0', './src-1');
		const destPkg1 = new PkgDesc('a-package', '1.0.0', './dest-1');

		const srcPkg2 = new PkgDesc('z-package', '2.0.0', './src-2');
		const destPkg2 = new PkgDesc('z-package', '2.0.0', './dest-2');

		manifest.addPackage(srcPkg2, destPkg2);
		manifest.addPackage(srcPkg1, destPkg1);

		manifest.addModuleFlags(srcPkg2, 'z-module', {flag: true});
		manifest.addModuleFlags(srcPkg2, 'a-module', {flag: true});

		const json = manifest.toJSON();

		expect(json.indexOf('a-package')).toBeLessThan(
			json.indexOf('z-package')
		);
		expect(json.indexOf('a-module')).toBeLessThan(json.indexOf('z-module'));
	});
});
