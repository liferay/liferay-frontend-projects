'use strict';

var assert = require('chai').assert;
require('./fixture/common.js');

var config = require('./fixture/config.js');
var configParser = new global.ConfigParser(config);

describe('DependencyBuilder', function() {
	it('should throw an exception if no modules are specified', function() {
		var dependencyBuilder = new global.DependencyBuilder();

		assert.ok(dependencyBuilder);

		assert.throws(function() {
			new dependencyBuilder.resolve();
		}, Error);
	});

	it('should resolve module without dependencies', function() {
		var dependencyBuilder = new global.DependencyBuilder(configParser);

		assert.ok(dependencyBuilder);

		var dependencies = dependencyBuilder.resolveDependencies(['aui-core']);

		assert.deepEqual(dependencies, ['aui-core']);
	});

	it('should resolve module with dependencies and no conditional modules', function() {
		var dependencyBuilder = new global.DependencyBuilder(configParser);

		assert.ok(dependencyBuilder);

		var dependencies = dependencyBuilder.resolveDependencies([
			'aui-dom-node',
		]);

		assert.deepEqual(dependencies, [
			'aui-base',
			'aui-core',
			'aui-node',
			'aui-dom-node',
		]);
	});

	it('should resolve module with versioned dependencies', function() {
		var dependencyBuilder = new global.DependencyBuilder(configParser);

		assert.ok(dependencyBuilder);

		var dependencies = dependencyBuilder.resolveDependencies([
			'isobject@2.1.0',
		]);

		assert.deepEqual(dependencies, ['isarray@1.0.0', 'isobject@2.1.0']);
	});

	it('should resolve module with dependencies and conditional modules', function() {
		var dependencyBuilder = new global.DependencyBuilder(configParser);

		assert.ok(dependencyBuilder);

		var dependencies = dependencyBuilder.resolveDependencies(['aui-nate']);

		assert.deepEqual(dependencies, [
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

	it('should resolve multiple modules', function() {
		var dependencyBuilder = new global.DependencyBuilder(configParser);

		assert.ok(dependencyBuilder);

		var dependencies = dependencyBuilder.resolveDependencies([
			'aui-dom-node',
			'aui-dialog',
		]);

		assert.deepEqual(dependencies, [
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
		var configParser = new global.ConfigParser();
		var dependencyBuilder = new global.DependencyBuilder(configParser);

		assert.ok(dependencyBuilder);

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

		assert.throws(function() {
			dependencyBuilder.resolveDependencies(['aui-cross1', 'aui-cross2']);
		}, Error);
	});

	it('should process provide proper cleanup', function() {
		var configParser = new global.ConfigParser();
		var dependencyBuilder = new global.DependencyBuilder(configParser);

		assert.ok(dependencyBuilder);

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

		assert.throws(function() {
			dependencyBuilder.resolveDependencies(['aui-cross1', 'aui-cross2']);
		}, Error);

		var modules = configParser.getModules();

		var cross1 = modules['aui-cross1'];
		var cross2 = modules['aui-cross2'];

		assert.strictEqual(cross1.tmpMark, false);
		assert.strictEqual(cross1.conditionalMark, false);
		assert.strictEqual(cross1.mark, false);

		assert.strictEqual(cross2.tmpMark, false);
		assert.strictEqual(cross2.conditionalMark, false);
		assert.strictEqual(cross2.mark, false);

		assert.strictEqual(dependencyBuilder._queue.length, 0);
	});

	it('should ignore "require" module', function() {
		var configParser = new global.ConfigParser();

		var dependencyBuilder = new global.DependencyBuilder(configParser);

		configParser.addModule({
			name: 'aui-123',
			dependencies: [],
		});

		configParser.addModule({
			name: 'test123',
			dependencies: ['aui-123', 'require'],
		});

		var result = dependencyBuilder.resolveDependencies(['test123']);

		assert.deepEqual(['aui-123', 'test123'], result);
	});

	it('should ignore "exports" module', function() {
		var configParser = new global.ConfigParser();

		var dependencyBuilder = new global.DependencyBuilder(configParser);

		configParser.addModule({
			name: 'aui-123',
			dependencies: [],
		});

		configParser.addModule({
			name: 'test123',
			dependencies: ['aui-123', 'exports'],
		});

		var result = dependencyBuilder.resolveDependencies(['test123']);

		assert.deepEqual(['aui-123', 'test123'], result);
	});

	it('should ignore "module" module', function() {
		var configParser = new global.ConfigParser();

		var dependencyBuilder = new global.DependencyBuilder(configParser);

		configParser.addModule({
			name: 'aui-123',
			dependencies: [],
		});

		configParser.addModule({
			name: 'test123',
			dependencies: ['aui-123', 'module'],
		});

		var result = dependencyBuilder.resolveDependencies(['test123']);

		assert.deepEqual(['aui-123', 'test123'], result);
	});

	it('should add dependencies on the fly', function() {
		var configParser = new global.ConfigParser();

		var dependencyBuilder = new global.DependencyBuilder(configParser);

		configParser.addModule({
			name: 'test123',
			dependencies: ['not-configured-dep'],
		});

		var deps = dependencyBuilder.resolveDependencies(['test123']);

		var modules = configParser.getModules();

		assert.sameMembers(['test123', 'not-configured-dep'], deps);
		assert.property(modules, 'test123');
		assert.property(modules, 'not-configured-dep');
	});

	it('should map the dependencies of the resolved modules', function() {
		var configParser = new global.ConfigParser({
			maps: {
				'not-configured-dep': 'not_configured_dep',
			},
		});

		var dependencyBuilder = new global.DependencyBuilder(configParser);

		configParser.addModule({
			name: 'test123',
			dependencies: ['not-configured-dep'],
		});

		var deps = dependencyBuilder.resolveDependencies(['test123']);

		var modules = configParser.getModules();

		assert.sameMembers(['test123', 'not_configured_dep'], deps);
		assert.property(modules, 'test123');
		assert.property(modules, 'not_configured_dep');
	});

	it('should resolve relative paths in module dependencies', function() {
		var configParser = new global.ConfigParser();

		var dependencyBuilder = new global.DependencyBuilder(configParser);

		configParser.addModule({
			name: 'test/test123/sub1',
			dependencies: ['../not-configured-dep'],
		});

		var deps = dependencyBuilder.resolveDependencies(['test/test123/sub1']);

		var modules = configParser.getModules();

		assert.sameMembers(
			['test/test123/sub1', 'test/not-configured-dep'],
			deps
		);
		assert.property(modules, 'test/test123/sub1');
		assert.property(modules, 'test/not-configured-dep');
	});

	it('should process modules with "exports" and "module" dependencies', function() {
		var configParser = new global.ConfigParser();

		var dependencyBuilder = new global.DependencyBuilder(configParser);

		configParser.addModule({
			name: 'exports-module',
			dependencies: ['exports', 'module'],
		});

		assert.doesNotThrow(function() {
			dependencyBuilder.resolveDependencies(['exports-module']);
		}, Error);
	});
});
