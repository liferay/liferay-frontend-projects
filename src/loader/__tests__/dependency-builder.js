import config from './fixture/config.js';
import ConfigParser from '../config-parser';
import DependencyBuilder from '../dependency-builder';

let configParser;
let dependencyBuilder;

describe('DependencyBuilder', () => {
	beforeEach(() => {
		configParser = new ConfigParser(config);
		dependencyBuilder = new DependencyBuilder(configParser);

		window.fetch = jest.fn().mockImplementation(param => {
			let encodedModules = param.split(
				'/o/js_resolve_modules?modules='
			)[1];

			let modules = decodeURIComponent(encodedModules);

			return Promise.resolve({
				text: () => Promise.resolve(JSON.stringify(modules.split(','))),
			});
		});
	});

	it('should throw an exception if no modules are specified', () => {
		expect(() => dependencyBuilder.resolve()).toThrow();
	});

	it('should resolve module', () => {
		return dependencyBuilder
			.resolveDependencies(['aui-core'])
			.then(dependencies => {
				expect(dependencies).toEqual(['aui-core']);
			});
	});

	it('should resolve multiple modules', () => {
		return dependencyBuilder
			.resolveDependencies([
				'aui-base',
				'aui-core',
				'aui-node',
				'aui-dom-node',
			])
			.then(dependencies => {
				expect(dependencies).toEqual([
					'aui-base',
					'aui-core',
					'aui-node',
					'aui-dom-node',
				]);
			});
	});

	it('should resolve with cached resolution', async () => {
		expect(window.fetch.mock.calls.length).toBe(0);

		let dependencies = await dependencyBuilder.resolveDependencies([
			'isobject@2.1.0',
		]);

		expect(dependencies).toEqual(['isobject@2.1.0']);
		expect(window.fetch.mock.calls.length).toBe(1);

		dependencies = await dependencyBuilder.resolveDependencies([
			'isobject@2.1.0',
		]);

		expect(Object.keys(dependencyBuilder._cachedResolutions)).toContain(
			'isobject@2.1.0'
		);
		expect(dependencies).toEqual(['isobject@2.1.0']);
		expect(window.fetch.mock.calls.length).toBe(1);
	});
});
