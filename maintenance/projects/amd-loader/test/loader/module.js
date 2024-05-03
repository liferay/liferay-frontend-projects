/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Module from '../../src/loader/module';

describe('Module', () => {
	let module;

	beforeEach(() => {
		module = new Module('a-module');
	});

	it('returns the correct module name', () => {
		expect(module.name).toBe('a-module');
	});

	it('name should be read only', () => {
		expect(() => {
			module.name = 'x';
		}).toThrow();
	});

	it('dependencies should be writable just once', () => {
		expect(module.dependencies).toBeUndefined();

		const dependencies = ['a', 'b'];

		module.dependencies = dependencies;

		expect(module.dependencies).toBe(dependencies);

		expect(() => {
			module.dependencies = dependencies;
		}).toThrow();

		expect(module.dependencies).toBe(dependencies);
	});

	it('factory should be writable just once', () => {
		expect(module.factory).toBeUndefined();

		const factory = () => {};

		module.factory = factory;

		expect(module.factory).toBe(factory);

		expect(() => {
			module.factory = factory;
		}).toThrow();

		expect(module.factory).toBe(factory);
	});
});
