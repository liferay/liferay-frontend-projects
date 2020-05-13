/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import path from 'path';

import PkgDesc from '../../../bundler/PkgDesc';
import Manifest from '../Manifest';

it('addPackage works', () => {
	const manifest = new Manifest();

	const srcPkg = new PkgDesc('a-package', '1.0.0', './src');
	const destPkg = new PkgDesc('a-package', '1.0.0', './dest');

	manifest.addPackage(srcPkg, destPkg);

	expect((manifest as any)._json.packages[srcPkg.id]).toMatchSnapshot();
});

it('getPackage returns entries with relative paths', () => {
	const manifest = new Manifest();

	const srcPkg = new PkgDesc('a-package', '1.0.0', path.resolve('./src'));
	const destPkg = new PkgDesc('a-package', '1.0.0', path.resolve('./dest'));

	manifest.addPackage(srcPkg, destPkg);

	const entry = (manifest as any)._json.packages[srcPkg.id];

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

		manifest.addModuleFlags(srcPkg2.id, 'z-module', {esModule: true});
		manifest.addModuleFlags(srcPkg2.id, 'a-module', {esModule: true});

		const json = manifest.toJSON();

		expect(json.indexOf('a-package')).toBeLessThan(
			json.indexOf('z-package')
		);
		expect(json.indexOf('a-module')).toBeLessThan(json.indexOf('z-module'));
	});
});
