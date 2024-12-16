/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

import * as pkgs from '../packages';

describe('resolveModuleFile', () => {
	const pkgDir = path.join(
		__dirname,
		'__fixtures__',
		'packages',
		'a-package'
	);

	it('works for file names with extension', () => {
		expect(pkgs.resolveModuleFile(pkgDir, 'no-package-json/index.js')).toBe(
			path.join('no-package-json', 'index.js')
		);

		expect(
			pkgs.resolveModuleFile(pkgDir, './no-package-json/index.js')
		).toBe(path.join('no-package-json', 'index.js'));
	});

	it('works for file names without .js extension', () => {
		expect(pkgs.resolveModuleFile(pkgDir, 'no-package-json/index')).toBe(
			path.join('no-package-json', 'index.js')
		);

		expect(pkgs.resolveModuleFile(pkgDir, './no-package-json/index')).toBe(
			path.join('no-package-json', 'index.js')
		);
	});

	it('works for existing modules with .js on their name', () => {
		expect(
			pkgs.resolveModuleFile(pkgDir, './no-package-json/file.js')
		).toBe(path.join('no-package-json', 'file.js.js'));
	});

	it('works for non-existent modules', () => {
		expect(
			pkgs.resolveModuleFile(
				pkgDir,
				'./no-package-json/non-existent-module'
			)
		).toBe(path.join('no-package-json', 'non-existent-module.js'));

		expect(
			pkgs.resolveModuleFile(
				pkgDir,
				'./no-package-json/non-existent-module.js'
			)
		).toBe(path.join('no-package-json', 'non-existent-module.js'));
	});

	it('works for directories without package.json file', () => {
		expect(pkgs.resolveModuleFile(pkgDir, 'no-package-json')).toBe(
			path.join('no-package-json', 'index.js')
		);

		expect(pkgs.resolveModuleFile(pkgDir, './no-package-json')).toBe(
			path.join('no-package-json', 'index.js')
		);
	});

	it('works for directories with a package.json file', () => {
		expect(
			pkgs.resolveModuleFile(
				pkgDir,
				'with-package-json/no-dot/no-extension'
			)
		).toBe(
			path.join('with-package-json', 'no-dot', 'no-extension', 'file.js')
		);

		expect(
			pkgs.resolveModuleFile(
				pkgDir,
				'with-package-json/no-dot/with-extension'
			)
		).toBe(
			path.join(
				'with-package-json',
				'no-dot',
				'with-extension',
				'file.js'
			)
		);

		expect(
			pkgs.resolveModuleFile(
				pkgDir,
				'with-package-json/with-dot/no-extension'
			)
		).toBe(
			path.join(
				'with-package-json',
				'with-dot',
				'no-extension',
				'file.js'
			)
		);

		expect(
			pkgs.resolveModuleFile(
				pkgDir,
				'with-package-json/with-dot/with-extension'
			)
		).toBe(
			path.join(
				'with-package-json',
				'with-dot',
				'with-extension',
				'file.js'
			)
		);
	});
});
