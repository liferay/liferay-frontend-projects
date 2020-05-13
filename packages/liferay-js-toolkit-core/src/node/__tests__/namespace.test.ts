/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as ns from '../namespace';

const pkg = {
	name: 'a-package',
};

it('makeNamespace works', () => {
	expect(ns.makeNamespace(pkg)).toBe('a-package$');
});

describe('when using regular packages', () => {
	it('isNamespaced works', () => {
		// Package alone
		expect(ns.isNamespaced('a-package$b-package')).toBe(true);
		expect(ns.isNamespaced('b-package')).toBe(false);

		// Package and module
		expect(ns.isNamespaced('a-package$b-package/a-module')).toBe(true);
		expect(ns.isNamespaced('b-package/a-module')).toBe(false);
		expect(ns.isNamespaced('b-package/a-module/$.a-function')).toBe(false);
	});

	it('getNamespace works', () => {
		// Package alone
		expect(ns.getNamespace('a-package$b-package')).toBe('a-package$');
		expect(ns.getNamespace('b-package')).toBeNull();

		// Package and module
		expect(ns.getNamespace('a-package$b-package/a-module')).toBe(
			'a-package$'
		);
		expect(ns.getNamespace('b-package/a-module')).toBeNull();
		expect(ns.getNamespace('b-package/a-module/$.a-function')).toBeNull();
	});

	it('addNamespace works', () => {
		// Package alone
		expect(ns.addNamespace('a-package$b-package', pkg)).toBe(
			'a-package$b-package'
		);
		expect(ns.addNamespace('b-package', pkg)).toBe('a-package$b-package');

		// Package and module
		expect(ns.addNamespace('a-package$b-package/a-module', pkg)).toBe(
			'a-package$b-package/a-module'
		);
		expect(ns.addNamespace('b-package/a-module', pkg)).toBe(
			'a-package$b-package/a-module'
		);
	});

	it('addNamespace throws if existing namespace and pkg do not match', () => {
		// Package alone
		expect(() => ns.addNamespace('other-package$b-package', pkg)).toThrow();

		// Package and module
		expect(() =>
			ns.addNamespace('other-package$b-package/a-module', pkg)
		).toThrow();
	});

	it('addNamespace does not throw when allowOverride is true', () => {
		// Package alone
		expect(
			ns.addNamespace('other-package$b-package', pkg, {
				allowOverride: true,
			})
		).toBe('a-package$b-package');

		// Package and module
		expect(
			ns.addNamespace('other-package$b-package/a-module', pkg, {
				allowOverride: true,
			})
		).toBe('a-package$b-package/a-module');
	});

	it('addNamespace leaves local module names untouched', () => {
		expect(ns.addNamespace('./path/to/module', {name: 'a-package'})).toBe(
			'./path/to/module'
		);

		expect(ns.addNamespace('../path/to/module', {name: 'a-package'})).toBe(
			'../path/to/module'
		);

		expect(
			ns.addNamespace('a-package/path/to/module', {name: 'a-package'})
		).toBe('a-package/path/to/module');
	});

	it('removeNamespace works', () => {
		// Package alone
		expect(ns.removeNamespace('a-package$b-package')).toBe('b-package');
		expect(ns.removeNamespace('b-package')).toBe('b-package');

		// Package and module
		expect(ns.removeNamespace('a-package$b-package/a-module')).toBe(
			'b-package/a-module'
		);
		expect(ns.removeNamespace('b-package/a-module')).toBe(
			'b-package/a-module'
		);
		expect(ns.removeNamespace('b-package/a-module/$.a-function')).toBe(
			'b-package/a-module/$.a-function'
		);
	});
});

describe('when using scoped packages', () => {
	it('isNamespaced works', () => {
		// Scope alone
		expect(ns.isNamespaced('@a-package$scope')).toBe(true);
		expect(ns.isNamespaced('@scope')).toBe(false);

		// Scope and package
		expect(ns.isNamespaced('@a-package$scope/b-package')).toBe(true);
		expect(ns.isNamespaced('@scope/b-package')).toBe(false);

		// Scope, package and module
		expect(ns.isNamespaced('@a-package$scope/b-package/a-module')).toBe(
			true
		);
		expect(ns.isNamespaced('@scope/b-package/a-module')).toBe(false);
		expect(ns.isNamespaced('@scope/b-package/a-module/$.a-function')).toBe(
			false
		);
	});

	it('getNamespace works', () => {
		// Package alone
		expect(ns.getNamespace('@a-package$scope/b-package')).toBe(
			'a-package$'
		);
		expect(ns.getNamespace('@scope/b-package')).toBeNull();

		// Package and module
		expect(ns.getNamespace('@a-package$scope/b-package/a-module')).toBe(
			'a-package$'
		);
		expect(ns.getNamespace('@scope/b-package/a-module')).toBeNull();
		expect(
			ns.getNamespace('@scope/b-package/a-module/$.a-function')
		).toBeNull();
	});

	it('addNamespace works', () => {
		// Scope alone
		expect(ns.addNamespace('@a-package$scope', pkg)).toBe(
			'@a-package$scope'
		);
		expect(ns.addNamespace('@scope', pkg)).toBe('@a-package$scope');

		// Scope and package
		expect(ns.addNamespace('@a-package$scope/b-package', pkg)).toBe(
			'@a-package$scope/b-package'
		);
		expect(ns.addNamespace('@scope/b-package', pkg)).toBe(
			'@a-package$scope/b-package'
		);

		// Scope, package and module
		expect(
			ns.addNamespace('@a-package$scope/b-package/a-module', pkg)
		).toBe('@a-package$scope/b-package/a-module');
		expect(ns.addNamespace('@scope/b-package/a-module', pkg)).toBe(
			'@a-package$scope/b-package/a-module'
		);
	});

	it('addNamespace throws if existing namespace and pkg do not match', () => {
		// Package alone
		expect(() =>
			ns.addNamespace('@other-package$scope/b-package', pkg)
		).toThrow();

		// Package and module
		expect(() =>
			ns.addNamespace('@other-package$scope/b-package/a-module', pkg)
		).toThrow();
	});

	it('addNamespace does not throw when allowOverride is true', () => {
		// Package alone
		expect(
			ns.addNamespace('@other-package$scope/b-package', pkg, {
				allowOverride: true,
			})
		).toBe('@a-package$scope/b-package');

		// Package and module
		expect(
			ns.addNamespace('@other-package$scope/b-package/a-module', pkg, {
				allowOverride: true,
			})
		).toBe('@a-package$scope/b-package/a-module');
	});

	it('addNamespace leaves local module names untouched', () => {
		expect(
			ns.addNamespace('./path/to/module', {name: '@scope/a-package'})
		).toBe('./path/to/module');

		expect(
			ns.addNamespace('../path/to/module', {name: '@scope/a-package'})
		).toBe('../path/to/module');

		expect(
			ns.addNamespace('@scope/a-package/path/to/module', {
				name: '@scope/a-package',
			})
		).toBe('@scope/a-package/path/to/module');
	});

	it('removeNamespace works', () => {
		// Scope alone
		expect(ns.removeNamespace('@a-package$scope')).toBe('@scope');
		expect(ns.removeNamespace('@scope')).toBe('@scope');

		// Scope and package
		expect(ns.removeNamespace('@a-package$scope/b-package')).toBe(
			'@scope/b-package'
		);
		expect(ns.removeNamespace('@scope/b-package')).toBe('@scope/b-package');

		// Scope, package and module
		expect(ns.removeNamespace('@a-package$scope/b-package/a-module')).toBe(
			'@scope/b-package/a-module'
		);
		expect(ns.removeNamespace('@scope/b-package/a-module')).toBe(
			'@scope/b-package/a-module'
		);
		expect(
			ns.removeNamespace('@scope/b-package/a-module/$.a-function')
		).toBe('@scope/b-package/a-module/$.a-function');
	});
});
