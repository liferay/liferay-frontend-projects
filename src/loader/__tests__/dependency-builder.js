import config from './fixture/config.js';
import ConfigParser from '../config-parser';
import DependencyBuilder from '../dependency-builder';

const configParser = new ConfigParser(config);

describe('DependencyBuilder', function() {
	it('should throw an exception if no modules are specified', function() {
		let dependencyBuilder = new DependencyBuilder();

		expect(() => dependencyBuilder.resolve()).toThrow();
	});

	it('should resolve module without dependencies', function() {
		let dependencyBuilder = new DependencyBuilder(configParser);

		let dependencies = dependencyBuilder.resolveDependencies(['aui-core']);

		expect(dependencies).toEqual(['aui-core']);
	});

	it(
		'should resolve module with dependencies and no conditional ' +
			'modules',
		function() {
			let dependencyBuilder = new DependencyBuilder(configParser);

			let dependencies = dependencyBuilder.resolveDependencies([
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

	it('should resolve module with versioned dependencies', function() {
		let dependencyBuilder = new DependencyBuilder(configParser);

		let dependencies = dependencyBuilder.resolveDependencies([
			'isobject@2.1.0',
		]);

		expect(dependencies).toEqual(['isarray@1.0.0', 'isobject@2.1.0']);
	});

	it(
		'should resolve module with dependencies and conditional ' + 'modules',
		function() {
			let dependencyBuilder = new DependencyBuilder(configParser);

			let dependencies = dependencyBuilder.resolveDependencies([
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
		}
	);

	it('should resolve multiple modules', function() {
		let dependencyBuilder = new DependencyBuilder(configParser);

		let dependencies = dependencyBuilder.resolveDependencies([
			'aui-dom-node',
			'aui-dialog',
		]);

		expect(dependencies).toEqual([
			'aui-base',
			'aui-core',
			'aui-node',
			'aui-dom-node',
			'aui-plugin-base',
			'aui-dialog',
			'aui-test2',
		]);
	});

	it('should throw error if there are circular dependencies', function() {
		let configParser = new ConfigParser();
		let dependencyBuilder = new DependencyBuilder(configParser);

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

	it('should process provide proper cleanup', function() {
		let configParser = new ConfigParser();
		let dependencyBuilder = new DependencyBuilder(configParser);

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

		let modules = configParser.getModules();

		let cross1 = modules['aui-cross1'];
		let cross2 = modules['aui-cross2'];

		expect(cross1.tmpMark).toBe(false);
		expect(cross1.conditionalMark).toBe(false);
		expect(cross1.mark).toBe(false);

		expect(cross2.tmpMark).toBe(false);
		expect(cross2.conditionalMark).toBe(false);
		expect(cross2.mark).toBe(false);

		expect(dependencyBuilder._queue).toHaveLength(0);
	});

	it('should ignore "require" module', function() {
		let configParser = new ConfigParser();

		let dependencyBuilder = new DependencyBuilder(configParser);

		configParser.addModule({
			name: 'aui-123',
			dependencies: [],
		});

		configParser.addModule({
			name: 'test123',
			dependencies: ['aui-123', 'require'],
		});

		let result = dependencyBuilder.resolveDependencies(['test123']);

		expect(result).toEqual(['aui-123', 'test123']);
	});

	it('should ignore "exports" module', function() {
		let configParser = new ConfigParser();

		let dependencyBuilder = new DependencyBuilder(configParser);

		configParser.addModule({
			name: 'aui-123',
			dependencies: [],
		});

		configParser.addModule({
			name: 'test123',
			dependencies: ['aui-123', 'exports'],
		});

		let result = dependencyBuilder.resolveDependencies(['test123']);

		expect(result).toEqual(['aui-123', 'test123']);
	});

	it('should ignore "module" module', function() {
		let configParser = new ConfigParser();

		let dependencyBuilder = new DependencyBuilder(configParser);

		configParser.addModule({
			name: 'aui-123',
			dependencies: [],
		});

		configParser.addModule({
			name: 'test123',
			dependencies: ['aui-123', 'module'],
		});

		let result = dependencyBuilder.resolveDependencies(['test123']);

		expect(result).toEqual(['aui-123', 'test123']);
	});

	it('should add dependencies on the fly', function() {
		let configParser = new ConfigParser();

		let dependencyBuilder = new DependencyBuilder(configParser);

		configParser.addModule({
			name: 'test123',
			dependencies: ['not-configured-dep'],
		});

		let deps = dependencyBuilder.resolveDependencies(['test123']);

		let modules = configParser.getModules();

		expect(deps).toEqual(['not-configured-dep', 'test123']);
		expect(modules).toHaveProperty('test123');
		expect(modules).toHaveProperty('not-configured-dep');
	});

	it('should map the dependencies of the resolved modules', function() {
		let configParser = new ConfigParser({
			maps: {
				'not-configured-dep': 'not_configured_dep',
			},
		});

		let dependencyBuilder = new DependencyBuilder(configParser);

		configParser.addModule({
			name: 'test123',
			dependencies: ['not-configured-dep'],
		});

		let deps = dependencyBuilder.resolveDependencies(['test123']);

		let modules = configParser.getModules();

		expect(deps).toEqual(['not_configured_dep', 'test123']);
		expect(modules).toHaveProperty('test123');
		expect(modules).toHaveProperty('not_configured_dep');
	});

	it('should resolve relative paths in module dependencies', function() {
		let configParser = new ConfigParser();

		let dependencyBuilder = new DependencyBuilder(configParser);

		configParser.addModule({
			name: 'test/test123/sub1',
			dependencies: ['../not-configured-dep'],
		});

		let deps = dependencyBuilder.resolveDependencies(['test/test123/sub1']);

		let modules = configParser.getModules();

		expect(deps).toEqual(['test/not-configured-dep', 'test/test123/sub1']);
		expect(modules).toHaveProperty('test/test123/sub1');
		expect(modules).toHaveProperty('test/not-configured-dep');
	});

	it(
		'should process modules with "exports" and "module" ' + 'dependencies',
		function() {
			let configParser = new ConfigParser();

			let dependencyBuilder = new DependencyBuilder(configParser);

			configParser.addModule({
				name: 'exports-module',
				dependencies: ['exports', 'module'],
			});

			expect(() =>
				dependencyBuilder.resolveDependencies(['exports-module'])
			).not.toThrow();
		}
	);
});
