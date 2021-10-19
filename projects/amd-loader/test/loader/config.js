/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Config from '../../src/loader/config';
import Module from '../../src/loader/module';

describe('Config', () => {
	let config;

	beforeEach(() => {
		config = new Config();
	});

	it('creates an instance of Config without existing data', () => {
		expect(config.getModules()).toHaveLength(0);
	});

	describe('getModules()', () => {
		it('returns all modules when called without arguments', () => {
			config.addModule('a-module');
			config.addModule('b-module');
			expect(config.getModules()).toMatchObject([
				expect.any(Module),
				expect.any(Module),
			]);
		});

		it('returns no modules when called with empty array', () => {
			config.addModule('a-module');
			config.addModule('b-module');
			expect(config.getModules([])).toMatchObject([]);
		});

		it('returns undefined for missing modules', () => {
			config.addModule('a-module');

			const modules = config.getModules(['a-module', 'b-module']);

			expect(modules).toMatchObject([expect.any(Module), undefined]);
		});
	});

	it('adds new module', () => {
		const addedModule = config.addModule('a-module');
		const modules = config.getModules();

		expect(modules[0]).toBeDefined();
		expect(modules[0]).toBe(addedModule);
		expect(modules[0].name).toBe('a-module');
	});

	it('throws when addModule called twice', () => {
		config.addModule('a-module');
		expect(() => config.addModule('a-module')).toThrow();
	});

	it('maps a module to its alias', () => {
		const addedModule = config.addModule('liferay@1.0.0');

		config.addMappings({liferay: 'liferay@1.0.0'});

		const mappedModule = config.getModule('liferay');

		expect(mappedModule).toBe(addedModule);
	});

	it('respects "exactMatch" mappings', () => {
		const addedModule = config.addModule('liferay@1.0.0/index');

		config.addMappings({
			'liferay@1.0.0': {
				exactMatch: true,
				value: 'liferay@1.0.0/index',
			},
		});

		let mappedModule = config.getModule('liferay@1.0.0');

		expect(mappedModule).toBe(addedModule);

		mappedModule = config.getModule('liferay@1.0.0/index');

		expect(mappedModule).toBe(addedModule);
	});

	it('maps an array of modules to their aliases', () => {
		const addedModule1 = config.addModule('liferay@1.0.0');
		const addedModule2 = config.addModule('liferay@2.0.0');

		config.addMappings({
			liferay: 'liferay@1.0.0',
			liferay2: 'liferay@2.0.0',
		});

		const mappedModules = config.getModules(['liferay', 'liferay2']);

		expect(mappedModules).toEqual([addedModule1, addedModule2]);
	});

	it('maps a module via a mapping function', () => {
		const addedModule1 = config.addModule('liferaytest');
		const addedModule2 = config.addModule('liferay2test');

		config.addMappings({
			'*': (name) => name + 'test',
		});

		const mappedModules = config.getModules(['liferay', 'liferay2']);

		expect(mappedModules).toEqual([addedModule1, addedModule2]);
	});

	it('ignores a mapping function if a more specific module mapping exists', () => {
		const addedModule1 = config.addModule('liferay@1.0.0');
		const addedModule2 = config.addModule('liferay2test');

		config.addMappings({
			'*': (name) => name + 'test',
			'liferay': 'liferay@1.0.0',
		});

		const mappedModules = config.getModules(['liferay', 'liferay2']);

		expect(mappedModules).toEqual([addedModule1, addedModule2]);
	});

	it('applies exactMatches first', () => {
		const addedModule1 = config.addModule('liferay@1.0.0/index');
		const addedModule2 = config.addModule('liferay@2.0.0/main');
		const addedModule3 = config.addModule('liferay@2.0.0');
		const addedModule4 = config.addModule('liferayX');

		config.addMappings({
			'liferay': 'liferay@2.0.0',
			'liferay/index': {
				exactMatch: true,
				value: 'liferay@1.0.0/index',
			},
		});

		let mappedModule = config.getModule('liferay/index');

		expect(mappedModule).toBe(addedModule1);

		mappedModule = config.getModule('liferay/main');

		expect(mappedModule).toBe(addedModule2);

		mappedModule = config.getModule('liferay');

		expect(mappedModule).toBe(addedModule3);

		mappedModule = config.getModule('liferayX');

		expect(mappedModule).toBe(addedModule4);
	});

	it('stops replacement for exact identity matches', () => {
		const addedModule = config.addModule('liferay/index');

		config.addMappings({
			'liferay': 'this-should-not-be-applied',
			'liferay/index': {
				exactMatch: true,
				value: 'liferay/index',
			},
		});

		const mappedModule = config.getModule('liferay/index');

		expect(mappedModule).toBe(addedModule);
	});

	it('maps local modules correctly', () => {
		const currentModule = config.addModule('isobject@2.1.0/index');
		const dependency1 = config.addModule('isarray@1.0.0');
		const dependency2 = config.addModule('isarray@1.0.0/index');

		currentModule.dependencies = [
			'module',
			'require',
			'isarray',
			'isarray/index',
		];
		currentModule.map = {
			isarray: 'isarray@1.0.0',
		};

		let mappedModule = config.getDependency(currentModule.name, 'isarray');

		expect(mappedModule).toBe(dependency1);

		mappedModule = config.getDependency(
			currentModule.name,
			'isarray/index'
		);

		expect(mappedModule).toBe(dependency2);
	});
});
