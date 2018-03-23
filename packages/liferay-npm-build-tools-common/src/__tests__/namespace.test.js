import * as ns from '../namespace';

const rootPkgJson = {
	name: 'a-package',
	version: '1.0.2',
};

it('getNamespace works', () => {
	expect(ns.getNamespace(rootPkgJson)).toBe('a-package$1.0.2$');
});

describe('when using regular packages', () => {
	it('isNamespaced works', () => {
		// Package alone
		expect(ns.isNamespaced('a-package$1.0.2$b-package', rootPkgJson)).toBe(
			true
		);
		expect(ns.isNamespaced('b-package', rootPkgJson)).toBe(false);

		// Package and module
		expect(
			ns.isNamespaced('a-package$1.0.2$b-package/a-module', rootPkgJson)
		).toBe(true);
		expect(ns.isNamespaced('b-package/a-module', rootPkgJson)).toBe(false);
	});

	it('addNamespace works', () => {
		// Package alone
		expect(ns.addNamespace('a-package$1.0.2$b-package', rootPkgJson)).toBe(
			'a-package$1.0.2$b-package'
		);
		expect(ns.addNamespace('b-package', rootPkgJson)).toBe(
			'a-package$1.0.2$b-package'
		);

		// Package and module
		expect(
			ns.addNamespace('a-package$1.0.2$b-package/a-module', rootPkgJson)
		).toBe('a-package$1.0.2$b-package/a-module');
		expect(ns.addNamespace('b-package/a-module', rootPkgJson)).toBe(
			'a-package$1.0.2$b-package/a-module'
		);
	});

	it('removeNamespace works', () => {
		// Package alone
		expect(
			ns.removeNamespace('a-package$1.0.2$b-package', rootPkgJson)
		).toBe('b-package');
		expect(ns.removeNamespace('b-package', rootPkgJson)).toBe('b-package');

		// Package and module
		expect(
			ns.removeNamespace(
				'a-package$1.0.2$b-package/a-module',
				rootPkgJson
			)
		).toBe('b-package/a-module');
		expect(ns.removeNamespace('b-package/a-module', rootPkgJson)).toBe(
			'b-package/a-module'
		);
	});
});

describe('when using scoped packages', () => {
	it('isNamespaced works', () => {
		// Scope alone
		expect(ns.isNamespaced('@a-package$1.0.2$scope', rootPkgJson)).toBe(
			true
		);
		expect(ns.isNamespaced('@scope', rootPkgJson)).toBe(false);

		// Scope and package
		expect(
			ns.isNamespaced('@a-package$1.0.2$scope/b-package', rootPkgJson)
		).toBe(true);
		expect(ns.isNamespaced('@scope/b-package', rootPkgJson)).toBe(false);

		// Scope, package and module
		expect(
			ns.isNamespaced(
				'@a-package$1.0.2$scope/b-package/a-module',
				rootPkgJson
			)
		).toBe(true);
		expect(ns.isNamespaced('@scope/b-package/a-module', rootPkgJson)).toBe(
			false
		);
	});

	it('addNamespace works', () => {
		// Scope alone
		expect(ns.addNamespace('@a-package$1.0.2$scope', rootPkgJson)).toBe(
			'@a-package$1.0.2$scope'
		);
		expect(ns.addNamespace('@scope', rootPkgJson)).toBe(
			'@a-package$1.0.2$scope'
		);

		// Scope and package
		expect(
			ns.addNamespace('@a-package$1.0.2$scope/b-package', rootPkgJson)
		).toBe('@a-package$1.0.2$scope/b-package');
		expect(ns.addNamespace('@scope/b-package', rootPkgJson)).toBe(
			'@a-package$1.0.2$scope/b-package'
		);

		// Scope, package and module
		expect(
			ns.addNamespace(
				'@a-package$1.0.2$scope/b-package/a-module',
				rootPkgJson
			)
		).toBe('@a-package$1.0.2$scope/b-package/a-module');
		expect(ns.addNamespace('@scope/b-package/a-module', rootPkgJson)).toBe(
			'@a-package$1.0.2$scope/b-package/a-module'
		);
	});

	it('removeNamespace works', () => {
		// Scope alone
		expect(ns.removeNamespace('@a-package$1.0.2$scope', rootPkgJson)).toBe(
			'@scope'
		);
		expect(ns.removeNamespace('@scope', rootPkgJson)).toBe('@scope');

		// Scope and package
		expect(
			ns.removeNamespace('@a-package$1.0.2$scope/b-package', rootPkgJson)
		).toBe('@scope/b-package');
		expect(ns.removeNamespace('@scope/b-package', rootPkgJson)).toBe(
			'@scope/b-package'
		);

		// Scope, package and module
		expect(
			ns.removeNamespace(
				'@a-package$1.0.2$scope/b-package/a-module',
				rootPkgJson
			)
		).toBe('@scope/b-package/a-module');
		expect(
			ns.removeNamespace('@scope/b-package/a-module', rootPkgJson)
		).toBe('@scope/b-package/a-module');
	});
});
