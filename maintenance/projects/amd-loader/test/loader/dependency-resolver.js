/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Config from '../../src/loader/config';
import DependencyResolver from '../../src/loader/dependency-resolver';

describe('DependencyResolver', () => {
	let config;
	let dependencyResolver;
	let originalFetch;

	beforeEach(() => {
		config = new Config();
		dependencyResolver = new DependencyResolver(config);

		originalFetch = window.fetch;
		window.fetch = jest.fn((param) => {
			const encodedModules = param.replace(
				`${config.resolvePath}?modules=`,
				''
			);

			const modules = decodeURIComponent(encodedModules);

			return Promise.resolve({
				text: () => Promise.resolve(JSON.stringify(modules.split(','))),
			});
		});
	});

	afterEach(() => {
		window.fetch = originalFetch;
	});

	it('throws an exception if no modules are specified', () => {
		expect(() => dependencyResolver.resolve()).toThrow();
	});

	it('resolves a module', () => {
		return dependencyResolver.resolve(['aui-core']).then((dependencies) => {
			expect(dependencies).toEqual(['aui-core']);
		});
	});

	it('resolves multiple modules', () => {
		return dependencyResolver
			.resolve(['aui-base', 'aui-core', 'aui-node', 'aui-dom-node'])
			.then((dependencies) => {
				expect(dependencies).toEqual([
					'aui-base',
					'aui-core',
					'aui-node',
					'aui-dom-node',
				]);
			});
	});

	it('resolves with cached resolution', async () => {
		expect(window.fetch.mock.calls.length).toBe(0);

		let dependencies = await dependencyResolver.resolve(['isobject@2.1.0']);

		expect(dependencies).toEqual(['isobject@2.1.0']);
		expect(window.fetch.mock.calls.length).toBe(1);

		dependencies = await dependencyResolver.resolve(['isobject@2.1.0']);

		expect(Object.keys(dependencyResolver._cachedResolutions)).toContain(
			'isobject@2.1.0'
		);
		expect(dependencies).toEqual(['isobject@2.1.0']);
		expect(window.fetch.mock.calls.length).toBe(1);
	});
});
