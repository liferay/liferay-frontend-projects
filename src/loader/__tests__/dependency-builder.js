import config from './fixture/config.js';
import ConfigParser from '../config-parser';
import DependencyBuilder from '../dependency-builder';

let configParser;
let dependencyBuilder;

describe('DependencyBuilder', () => {
	beforeEach(() => {
		configParser = new ConfigParser(config);
		dependencyBuilder = new DependencyBuilder(configParser);
	});

	it('should throw an exception if no modules are specified', () => {
		expect(() => dependencyBuilder.resolve()).toThrow();
	});

	it('should resolve module without dependencies', () => {
		const dependencies = dependencyBuilder.resolveDependencies([
			'aui-core',
		]);

		expect(dependencies).toEqual(['aui-core']);
	});

	it(
		'should resolve module with dependencies and no conditional ' +
			'modules',
		() => {
			const dependencies = dependencyBuilder.resolveDependencies([
				'aui-dom-node',
			]);

			expect(dependencies).toEqual([
				'aui-base',
				'aui-core',
				'aui-node',
				'aui-dom-node',
			]);
		}
	);

	it('should resolve module with versioned dependencies', () => {
		const dependencies = dependencyBuilder.resolveDependencies([
			'isobject@2.1.0',
		]);

		expect(dependencies).toEqual(['isarray@1.0.0', 'isobject@2.1.0']);
	});

	it('should resolve module with dependencies and conditional modules', () => {
		const dependencies = dependencyBuilder.resolveDependencies([
			'aui-nate',
		]);

		expect(dependencies).toEqual([
			'aui-base',
			'aui-core',
			'aui-node',
			'aui-plugin-base',
			'aui-dialog',
			'aui-autocomplete',
			'aui-event',
			'aui-nate',
			'aui-chema',
			'aui-test2',
		]);
	});

	it('should resolve multiple modules', () => {
		const dependencies = dependencyBuilder.resolveDependencies([
			'aui-dom-node',
			'aui-dialog',
		]);

		expect(dependencies).toEqual([
			'aui-base',
			'aui-core',
			'aui-node',
			'aui-plugin-base',
			'aui-dialog',
			'aui-dom-node',
			'aui-test2',
		]);
	});

	it('should throw error if there are circular dependencies', () => {
		configParser.addModule({
			name: 'aui-cross1',
			dependencies: ['aui-cross2'],
			path: '/html/js/aui-cross1.js',
		});

		configParser.addModule({
			name: 'aui-cross2',
			dependencies: ['aui-cross1'],
			path: '/html/js/aui-cross2.js',
		});

		expect(() =>
			dependencyBuilder.resolveDependencies(['aui-cross1', 'aui-cross2'])
		).toThrow();
	});

	it('should process provide proper cleanup', () => {
		configParser.addModule({
			name: 'aui-cross1',
			dependencies: ['aui-cross2'],
			path: '/html/js/aui-cross1.js',
		});

		configParser.addModule({
			name: 'aui-cross2',
			dependencies: ['aui-cross1'],
			path: '/html/js/aui-cross2.js',
		});

		expect(() =>
			dependencyBuilder.resolveDependencies(['aui-cross1', 'aui-cross2'])
		).toThrow();

		const modules = configParser.getModules();
		const cross1 = modules['aui-cross1'];
		const cross2 = modules['aui-cross2'];

		expect(cross1.tmpMark).toBe(false);
		expect(cross1.conditionalMark).toBe(false);
		expect(cross1.mark).toBe(false);

		expect(cross2.tmpMark).toBe(false);
		expect(cross2.conditionalMark).toBe(false);
		expect(cross2.mark).toBe(false);

		expect(dependencyBuilder._queue).toHaveLength(0);
	});

	it('should ignore "require" module', () => {
		configParser.addModule({
			name: 'aui-123',
			dependencies: [],
		});

		configParser.addModule({
			name: 'test123',
			dependencies: ['aui-123', 'require'],
		});

		const dependencies = dependencyBuilder.resolveDependencies(['test123']);

		expect(dependencies).toEqual(['aui-123', 'test123']);
	});

	it('should ignore "exports" module', () => {
		configParser.addModule({
			name: 'aui-123',
			dependencies: [],
		});

		configParser.addModule({
			name: 'test123',
			dependencies: ['aui-123', 'exports'],
		});

		const dependencies = dependencyBuilder.resolveDependencies(['test123']);

		expect(dependencies).toEqual(['aui-123', 'test123']);
	});

	it('should ignore "module" module', () => {
		configParser.addModule({
			name: 'aui-123',
			dependencies: [],
		});

		configParser.addModule({
			name: 'test123',
			dependencies: ['aui-123', 'module'],
		});

		const dependencies = dependencyBuilder.resolveDependencies(['test123']);

		expect(dependencies).toEqual(['aui-123', 'test123']);
	});

	it('should add dependencies on the fly', () => {
		configParser.addModule({
			name: 'test123',
			dependencies: ['not-configured-dep'],
		});

		const dependencies = dependencyBuilder.resolveDependencies(['test123']);
		const modules = configParser.getModules();

		expect(dependencies).toEqual(['not-configured-dep', 'test123']);
		expect(modules).toHaveProperty('test123');
		expect(modules).toHaveProperty('not-configured-dep');
	});

	it('should map the dependencies of the resolved modules', () => {
		configParser = new ConfigParser({
			maps: {
				'not-configured-dep': 'not_configured_dep',
			},
		});
		dependencyBuilder = new DependencyBuilder(configParser);

		configParser.addModule({
			name: 'test123',
			dependencies: ['not-configured-dep'],
		});

		const dependencies = dependencyBuilder.resolveDependencies(['test123']);
		const modules = configParser.getModules();

		expect(dependencies).toEqual(['not_configured_dep', 'test123']);
		expect(modules).toHaveProperty('test123');
		expect(modules).toHaveProperty('not_configured_dep');
	});

	it('should resolve relative paths in module dependencies', () => {
		configParser.addModule({
			name: 'test/test123/sub1',
			dependencies: ['../not-configured-dep'],
		});

		const dependencies = dependencyBuilder.resolveDependencies([
			'test/test123/sub1',
		]);
		const modules = configParser.getModules();

		expect(dependencies).toEqual([
			'test/not-configured-dep',
			'test/test123/sub1',
		]);
		expect(modules).toHaveProperty('test/test123/sub1');
		expect(modules).toHaveProperty('test/not-configured-dep');
	});

	it('should process modules with "exports" and "module" dependencies', () => {
		configParser.addModule({
			name: 'exports-module',
			dependencies: ['exports', 'module'],
		});

		expect(() =>
			dependencyBuilder.resolveDependencies(['exports-module'])
		).not.toThrow();
	});

	it('should cache module resolutions as per issue #159', () => {
		const modules = ['aui-dom-node', 'isarray@1.0.0/index'];
		const dependencies = dependencyBuilder.resolveDependencies(modules);

		const expectedDependencies = [
			'aui-base',
			'aui-core',
			'aui-node',
			'aui-dom-node',
			'isarray@1.0.0/index',
		];

		expect(dependencies).toEqual(expectedDependencies);

		expect(
			dependencyBuilder._cachedResolutions[modules.sort().join()]
		).toEqual(expectedDependencies);
	});

	it('should not do dependency resolution again if cache is hit', () => {
		const modules = ['aui-dom-node'];

		const spy = jest.spyOn(dependencyBuilder, '_resolveDependencies');

		dependencyBuilder.resolveDependencies(modules);

		expect(spy).toHaveBeenCalled();

		spy.mockReset();

		dependencyBuilder.resolveDependencies(modules);

		expect(spy).not.toHaveBeenCalled();
	});
});
