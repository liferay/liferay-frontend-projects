/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as mod from '../modules';

it('isLocalModule() works', () => {
	expect(mod.isLocalModule('./a-module')).toBe(true);
	expect(mod.isLocalModule('../a-module')).toBe(true);
	expect(mod.isLocalModule('/a-module')).toBe(true);

	expect(mod.isLocalModule('a-module')).toBe(false);
});

it('isNodeCoreModule() works', () => {
	expect(mod.isNodeCoreModule('fs')).toBe(true);
	expect(mod.isNodeCoreModule('path')).toBe(true);
	expect(mod.isNodeCoreModule('process')).toBe(true);
	expect(mod.isNodeCoreModule('http')).toBe(true);

	expect(mod.isNodeCoreModule('./a-module')).toBe(false);
	expect(mod.isNodeCoreModule('../a-module')).toBe(false);
	expect(mod.isNodeCoreModule('/a-module')).toBe(false);
	expect(mod.isNodeCoreModule('a-module')).toBe(false);
});

it('isReservedDependency() works', () => {
	expect(mod.isReservedDependency('require')).toBe(true);
	expect(mod.isReservedDependency('module')).toBe(true);
	expect(mod.isReservedDependency('exports')).toBe(true);

	expect(mod.isReservedDependency('./a-module')).toBe(false);
	expect(mod.isReservedDependency('../a-module')).toBe(false);
	expect(mod.isReservedDependency('/a-module')).toBe(false);
	expect(mod.isReservedDependency('a-module')).toBe(false);
});

it('isExternalDependency() works', () => {
	expect(mod.isExternalDependency('a-module')).toBe(true);
	expect(mod.isExternalDependency('fs')).toBe(true);

	expect(mod.isExternalDependency('./a-module')).toBe(false);
	expect(mod.isExternalDependency('../a-module')).toBe(false);
	expect(mod.isExternalDependency('/a-module')).toBe(false);
});

it('joinModuleName() works', () => {
	expect(mod.joinModuleName('@a-scope', 'a-package', '/a-dir/a-module')).toBe(
		'@a-scope/a-package/a-dir/a-module'
	);
	expect(mod.joinModuleName('@a-scope', 'a-package')).toBe(
		'@a-scope/a-package'
	);
	expect(mod.joinModuleName(undefined, 'a-package', '/a-dir/a-module')).toBe(
		'a-package/a-dir/a-module'
	);
	expect(mod.joinModuleName(undefined, 'a-package')).toBe('a-package');
});

it('splitModuleName() works', () => {
	expect(mod.splitModuleName('@a-scope/a-package/a-dir/a-module')).toEqual({
		scope: '@a-scope',
		pkgName: 'a-package',
		modulePath: '/a-dir/a-module',
	});
	expect(mod.splitModuleName('@a-scope/a-package')).toEqual({
		scope: '@a-scope',
		pkgName: 'a-package',
	});
	expect(mod.splitModuleName('a-package/a-dir/a-module')).toEqual({
		pkgName: 'a-package',
		modulePath: '/a-dir/a-module',
	});
	expect(mod.splitModuleName('a-package')).toEqual({
		pkgName: 'a-package',
	});
});
