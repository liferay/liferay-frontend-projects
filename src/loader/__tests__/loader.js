import document from './fixture/virtual-document.js';
import Loader from '../loader';
import DependencyBuilder from '../dependency-builder';
jest.mock('../dependency-builder');

const {log, warn} = console;
let config;
let loader;

describe('Loader', function() {
	beforeEach(function() {
		console.log = jest.fn();
		console.warn = jest.fn();

		DependencyBuilder.mockClear();

		DependencyBuilder.mockImplementation(() => {
			return {
				resolve: (modules) => {
					return Promise.resolve({resolvedModules: modules});
				},
			};
		});

		Object.keys(require.cache).forEach(function(cache) {
			delete require.cache[cache];
		});

		config = {
			url: __dirname + '/fixture',
			basePath: '/modules',
			maps: {
				liferay: 'liferay@1.0.0',
				liferay2: 'liferay@2.0.0',
			},
			modules: {
				'delay': {
					dependencies: [],
				},
				'module1': {
					dependencies: ['module2', 'module3'],
				},
				'module2': {
					dependencies: [],
				},
				'module3': {
					dependencies: [],
				},
				'module5': {
					dependencies: ['module6', 'module7', 'exports'],
				},
				'module6': {
					dependencies: ['module7', 'exports'],
				},
				'module7': {
					dependencies: ['exports'],
				},
				'moduleMissing': {
					dependencies: [],
				},
				'liferay@1.0.0/relative1': {
					dependencies: ['exports', 'module', './relative2'],
					path: 'relative1.js',
				},
				'liferay@1.0.0/relative2': {
					dependencies: [
						'exports',
						'module',
						'./sub-relative/sub-relative1',
					],
					path: 'relative2.js',
				},
				'liferay@1.0.0/relative3': {
					dependencies: ['exports', 'module'],
					path: 'relative3.js',
				},
				'liferay@1.0.0/sub-relative/sub-relative1': {
					dependencies: ['exports', 'module', '../relative3'],
					path: 'sub-relative/sub-relative1.js',
				},
				'liferay@1.0.0': {
					dependencies: ['exports'],
					path: 'liferay.js',
				},
				'liferay@2.0.0': {
					dependencies: ['exports', 'liferay'],
					path: 'liferay2.js',
				},
				'exports-dep': {
					dependencies: ['exports'],
					path: 'exports-dep.js',
				},
				'module-dep': {
					dependencies: ['exports', 'module'],
					path: 'module-dep.js',
				},
				'module-require': {
					dependencies: ['exports', 'require', 'module1'],
					path: 'module-require.js',
				},
				'module-require-fail': {
					dependencies: ['exports', 'require'],
					path: 'module-require-fail.js',
				},
				'module-require-path': {
					dependencies: ['exports', 'require', 'liferay'],
					path: 'module-require-path.js',
				},
				'liferay@1.0.0/empty': {
					dependencies: [],
					path: 'empty.js',
				},
				'liferay@1.0.0/mappeddeps': {
					dependencies: ['liferay', 'liferay2'],
					path: 'mappeddeps.js',
				},
				'isobject@2.1.0/index': {
					path: 'isobject@2.1.0/index.js',
					dependencies: ['exports', 'isarray/index'],
					map: {
						isarray: 'isarray@1.0.0',
					},
				},
				'isarray@1.0.0/index': {
					path: 'isarray@1.0.0/index.js',
					dependencies: ['exports'],
				},
				'issue-140/a': {
					path: 'issue-140/a.js',
					dependencies: ['module'],
				},
				'issue-140/m1': {
					path: 'issue-140/m1.js',
					dependencies: ['module', 'require', 'issue-140/a'],
					map: {
						'mapped-issue-140': 'issue-140',
					},
				},
				'issue-140/m2/m2': {
					path: 'issue-140/m2/m2.js',
					dependencies: ['module', 'issue-140/m1'],
				},
				'issue-146/ignoreModuleVersion': {
					dependencies: [],
					path: 'issue-146/ignore-module-version.js',
				},
			},
		};

		config.waitTimeout = 0;

		config.paths = {};

		loader = new Loader(config, document);

		// This is needed for fixture modules to work
		global.require = Loader.prototype.require.bind(loader);
		global.define = Loader.prototype.define.bind(loader);
		global.define.amd = {};
	});

	afterEach(() => {
		console.log = log;
		console.warn = warn;
	});

	it('should add module to the configuration', function() {
		let moduleName = 'A538AEA3-C02D-4AC3-B4C3-8F5059475529';
		let modules = loader.getModules();

		expect(modules).not.toHaveProperty(moduleName);

		let module = loader.addModule({
			name: moduleName,
			dependencies: [],
		});

		expect(modules).toHaveProperty(moduleName);
		expect(typeof module).toBe('object');
		expect(module.name).toBe(moduleName);
	});

	it('should define a module without dependencies (except exports)', function(done) {
		let impl = jest.fn().mockImplementation(exports => {
			exports.pejJung = {};
		});

		loader.define('pej-jung', ['exports'], impl);

		setTimeout(function() {
			expect(impl.mock.calls).toHaveLength(0);

			let modules = loader.getModules();

			let module = modules['pej-jung'];

			expect(module).toBeDefined();
			expect(module.name).toBe('pej-jung');
			expect(module.pendingImplementation).toBe(impl);
			expect(module.requested).not.toBeDefined();

			done();
		}, 50);
	});

	it('should discover missing dependencies of already defined modules', function() {
		let module1 = Math.random().toString();
		let dep1 = Math.random().toString();

		let module2 = Math.random().toString();
		let dep2 = Math.random().toString();

		loader.define(module1, [dep1], function() {
			return 1;
		});
		loader.define(module2, [dep2], function() {
			return 1;
		});

		let missingDeps = loader._getMissingDependencies([module1, module2]);

		expect(Array.isArray(missingDeps)).toBe(true);
		expect(missingDeps).toHaveLength(2);
		expect(missingDeps).toContain(dep1);
		expect(missingDeps).toContain(dep2);
	});

	it('should resolve relative dependencies path in define', function() {
		let module = 'test/sub1/61E9D85E-EC97-437B-8C7B-41504ECEE6D2';
		let depName = '9532A579-DA65-4E26-B672-D573184A23C7';
		let dep = '../' + depName;

		loader.define(module, [dep], function() {});

		let modules = loader.getModules();

		expect(modules).toHaveProperty(module);
		expect(Array.isArray(modules[module].dependencies)).toBe(true);
		expect(modules[module].dependencies[0]).toBe(`test/${depName}`);
	});

	it('should not accept define with only one parameter', function() {
		expect(loader.define(function() {})).not.toBeDefined();
	});

	it('should not accept define with two parameters', function() {
		expect(loader.define(['exports'], function() {})).not.toBeDefined();
	});

	it('should define a module with name and without dependencies', function() {
		let module = '189765B0-7E15-48F1-9C87-10C5E8F86F55';

		let impl = function() {};

		loader.define(module, impl);

		let modules = loader.getModules();

		expect(modules).toHaveProperty(module);
		expect(Array.isArray(modules[module].dependencies)).toBe(true);
		expect(modules[module].pendingImplementation).toBe(impl);
		expect(modules[module].dependencies).toEqual(['module', 'exports']);
	});

	it('should define itself as AMD compatible loader', function() {
		expect(loader.define).toHaveProperty('amd');
		expect(typeof loader.define.amd).toBe('object');
	});

	it('should load already defined (manually) modules', function(done) {
		let failure = jest.fn();
		let success = jest.fn();

		loader.require(['aui-123', 'pej-jung'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);

			done();
		}, 50);
	});

	it('should load unregistered modules', function(done) {
		let one;
		let failure = jest.fn();
		let success = jest.fn().mockImplementation(_one => (one = _one));

		config.paths['one'] = '/modules2/one';
		config.paths['two'] = '/modules2/two';
		config.paths['three'] = '/modules2/three';

		loader.require(['one'], success, failure);

		setTimeout(function() {
			expect(DependencyBuilder).toHaveBeenCalledTimes(1);
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);
			expect(typeof one).toBe('function');

			done();
		}, 50);
	});

	it('should load previously registered modules', function(done) {
		let failure = jest.fn();
		let success = jest.fn();

		loader.require('module1', success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);

			done();
		}, 50);
	});

	it('should load module which implementation is an object', function(done) {
		loader.addModule({
			name: 'impl_as_object',
			dependencies: ['exports'],
			path: '/modules2/impl_as_object.js',
		});

		let failure = jest.fn();

		let implementation;
		let success = jest
			.fn()
			.mockImplementation(impl => (implementation = impl));

		loader.require(['impl_as_object'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);
			expect(typeof implementation).toBe('object');
			expect(implementation).toHaveProperty('pesho');

			done();
		}, 50);
	});

	it('should fail on registered but not existing file', function(done) {
		let failure = jest.fn();
		let success = jest.fn();

		loader.require('moduleMissing', success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(1);
			expect(success.mock.calls).toHaveLength(0);

			done();
		}, 50);
	});

	it('should succeed when requiring modules multiple times', function(done) {
		let failure = jest.fn();
		let success = jest.fn();

		loader.require(['module5'], success, failure);
		loader.require(['module6'], success, failure);
		loader.require(['module7'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(3);

			done();
		}, 50);
	});

	it('should ignore success and callback if not functions', function() {
		loader.require(['module1'], null, null);
	});

	it('should return conditional modules', function() {
		let conditionalModules = loader.getConditionalModules();

		expect(conditionalModules).toEqual({});
	});

	it('should load aliased modules', function(done) {
		let failure = jest.fn();
		let success = jest.fn();

		loader.require(['liferay'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);

			done();
		}, 50);
	});

	it('should load aliased modules with aliased dependencies', function(done) {
		let failure = jest.fn();
		let success = jest.fn();

		loader.require(['liferay2'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);

			done();
		}, 50);
	});

	it('should load module with "exports" dependency', function(done) {
		let failure = jest.fn();

		let successValue;
		let success = jest.fn().mockImplementation(val => (successValue = val));

		loader.require(['exports-dep'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);

			expect(typeof successValue).toBe('object');
			expect(successValue).toHaveProperty('default');
			expect(typeof successValue.default).toBe('function');
			expect(successValue.default.name).toBe('alabala');

			done();
		}, 50);
	});

	it('should load module with "exports" dependency twice', function(done) {
		let failure = jest.fn();

		let successValue;
		let success = jest.fn().mockImplementation(val => (successValue = val));

		loader.require(['exports-dep'], success, failure);
		loader.require(['exports-dep'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(2);

			expect(typeof successValue).toBe('object');
			expect(successValue).toHaveProperty('default');
			expect(typeof successValue.default).toBe('function');
			expect(successValue.default.name).toBe('alabala');

			done();
		}, 50);
	});

	it('should load module with "module" dependency', function(done) {
		let failure = jest.fn();

		let successValue;
		let success = jest.fn().mockImplementation(val => (successValue = val));

		loader.require(['module-dep'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);

			expect(typeof successValue).toBe('function');
			expect(successValue.name).toBe('alabala');

			done();
		}, 50);
	});

	it('should resolve the missing dependencies without multiple require calls', function(done) {
		loader.require = jest.spyOn(loader, 'require');

		let failure = jest.fn();
		let success = jest.fn();

		DependencyBuilder.mockImplementation(() => {
			return {
				resolve: () => {
					return Promise.resolve({
						resolvedModules: [
							'liferay@1.0.0/relative3',
							'liferay@1.0.0/sub-relative/sub-relative1',
							'liferay@1.0.0/relative2',
							'liferay@1.0.0/relative1',
						],
					});
				},
			};
		});

		loader.require(['liferay@1.0.0/relative1'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);
			expect(loader.require.mock.calls).toHaveLength(1);

			done();
		}, 50);
	});

	it('should load module with mapped dependencies without multiple require calls', function(done) {
		loader.require = jest.spyOn(loader, 'require');

		let failure = jest.fn();
		let success = jest.fn();

		DependencyBuilder.mockImplementation(() => {
			return {
				resolve: () => {
					return Promise.resolve({
						resolvedModules: [
							'liferay@1.0.0',
							'liferay@2.0.0',
							'liferay@1.0.0/mappeddeps',
						],
					});
				},
			};
		});

		loader.require(['liferay/mappeddeps'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);
			expect(loader.require.mock.calls).toHaveLength(1);

			done();
		}, 50);
	});

	it('should cancel a require in case of failure because of an empty module', function(done) {
		config.waitTimeout = 20;

		let failureError;
		let failure = jest.fn().mockImplementation(err => (failureError = err));
		let success = jest.fn();

		loader.require(['liferay@1.0.0/empty'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(1);
			expect(success.mock.calls).toHaveLength(0);

			expect(failureError instanceof Error).toBe(true);
			expect(failureError).toHaveProperty('dependencies');
			expect(failureError).toHaveProperty('mappedModules');
			expect(failureError).toHaveProperty('missingDependencies');
			expect(failureError).toHaveProperty('modules');

			done();
		}, 50);
	});

	it('should fail after a require timeout, but a valid module should still be loaded', function(done) {
		config.waitTimeout = 1;
		config.paths['delay'] = '/modules2/delay';

		let failureError;
		let failure = jest.fn().mockImplementation(err => (failureError = err));
		let success = jest.fn();

		loader.require(['delay'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(1);
			expect(success.mock.calls).toHaveLength(0);
			expect(failureError).toHaveProperty('modules');

			// Delay module adds "delay" property to global
			expect(global.delay).toBe(1);

			delete global.delay;
			done();
		}, 50);
	});

	it('should load modules which don\'t expose a define function', function(done) {
		loader.addModule({
			dependencies: [],
			exports: '_',
			name: 'underscore',
			path: '/modules2/underscore.js',
		});

		let failure = jest.fn();
		let success = jest.fn();

		loader.require(['underscore'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);

			expect(global).toHaveProperty('_');

			let modules = loader.getModules();
			expect(modules).toHaveProperty('underscore');
			expect(modules['underscore']).toHaveProperty('implementation');

			delete global._;
			done();
		}, 50);
	});

	it('should load modules which export multiple level variable', function(done) {
		loader.addModule({
			dependencies: [],
			exports: 'jquery.labelauty.prop1',
			name: 'labelauty',
			path: '/modules2/labelauty.js',
		});

		let failure = jest.fn();
		let success = jest.fn();

		loader.require(['labelauty'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);

			expect(global).toHaveProperty('jquery');
			expect(global.jquery).toHaveProperty('labelauty');
			expect(global.jquery.labelauty).toHaveProperty('prop1');

			let modules = loader.getModules();
			expect(modules['labelauty']).toHaveProperty('implementation');

			delete global['jquery'];
			done();
		}, 50);
	});

	it('should load modules which don\'t expose a define function twice', function(done) {
		loader.addModule({
			dependencies: [],
			exports: '_',
			name: 'underscore',
			path: '/modules2/underscore.js',
		});

		let failure = jest.fn();
		let success = jest.fn();

		loader.require(['underscore'], success, failure);
		loader.require(['underscore'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(2);

			expect(global).toHaveProperty('_');

			let modules = loader.getModules();
			expect(modules['underscore']).toHaveProperty('implementation');

			delete global._;
			done();
		}, 50);
	});

	it('should load modules which don\'t expose a define function twice and regular ones together', function(done) {
		loader.addModule({
			dependencies: [],
			exports: '_',
			name: 'underscore',
			path: '/modules2/underscore.js',
		});

		loader.addModule({
			dependencies: [],
			exports: '$',
			name: 'dollar',
			path: '/modules2/dollar.js',
		});

		let failure = jest.fn();
		let success = jest.fn();

		loader.require('module1', success, failure);
		loader.require(['underscore', 'dollar'], success, failure);
		loader.require(['underscore'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(3);

			expect(global).toHaveProperty('_');
			expect(global).toHaveProperty('$');

			let modules = loader.getModules();
			expect(modules['underscore']).toHaveProperty('implementation');

			delete global._;
			delete global.$;
			done();
		}, 50);
	});

	it('should not request module if added explicitly', function(done) {
		let module = {
			name: 'added_explicitly',
			dependencies: ['exports'],
			path: '/modules2/added_explicitly.js',
		};

		loader.addModule(module);

		loader.define(module.name, module.dependencies, function() {});

		let failure = jest.fn();
		let success = jest.fn();

		document.head.appendChild = jest.spyOn(document.head, 'appendChild');

		loader.require('added_explicitly', success, failure);

		setTimeout(function() {
			expect(document.head.appendChild.mock.calls).toHaveLength(0);
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);

			document.head.appendChild.mockRestore();

			done();
		}, 50);
	});

	it('should load modules even when same module is requested second time with another module', function(done) {
		let failure = jest.fn();
		let success = jest.fn();

		loader.require(['module3'], success, failure);
		loader.require(['module3', 'module7'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(2);

			done();
		}, 50);
	});

	it('should implement local require inside module implementation function', function(done) {
		let failure = jest.fn();

		let successModule;
		let success = jest
			.fn()
			.mockImplementation(module => (successModule = module));

		loader.require(['module-require'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);
			expect(successModule.resolved).toBe(true);

			done();
		}, 50);
	});

	it('should implement localRequire.toUrl inside module implementation function', function(done) {
		let failure = jest.fn();

		let successModule;
		let success = jest
			.fn()
			.mockImplementation(module => (successModule = module));

		loader.require(['module-require'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);
			expect(successModule.resolvedUrl).not.toBeNull();

			done();
		}, 50);
	});

	it('should map configured paths when local require is invoked', function(done) {
		let failure = jest.fn();

		let successModule;
		let success = jest
			.fn()
			.mockImplementation(module => (successModule = module));

		loader.require(['module-require-path'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);
			expect(successModule.resolved).toBe(true);

			done();
		}, 50);
	});

	it('should support relative paths in local require', function(done) {
		let failure = jest.fn();

		let successModule;
		let success = jest
			.fn()
			.mockImplementation(module => (successModule = module));

		loader.require(['rel-path/module-require-rel-path'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);
			expect(successModule.resolvedDot).toBe(true);
			expect(successModule.resolvedDot2).toBe(true);

			done();
		}, 50);
	});

	it('should fail when local require is called with an undeclared module', function(done) {
		let failure = jest.fn();

		let successModule;
		let success = jest
			.fn()
			.mockImplementation(module => (successModule = module));

		loader.require(['module-require-fail'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);
			expect(successModule.error).toBeDefined();
			expect(successModule.error instanceof Error).toBe(true);
			expect(successModule.error.toString()).toBe(
				'Error: Module "non-existent-module" has not been loaded yet for context: module-require-fail'
			);

			done();
		}, 50);
	});

	it('should implement async local require inside module implementation function', function(done) {
		let failure = jest.fn();

		let successModule;
		let success = jest
			.fn()
			.mockImplementation(module => (successModule = module));

		loader.require(['module-require-async'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);

			let resolved = successModule.resolved();

			expect(resolved).toHaveProperty('module1');
			expect(resolved.module1).toHaveProperty('module1log');
			expect(typeof resolved.module1.module1log).toBe('function');

			expect(resolved).toHaveProperty('module2');
			expect(resolved.module2).toHaveProperty('module2log');
			expect(typeof resolved.module2.module2log).toBe('function');

			done();
		}, 50);
	});

	it('should resolve dependency versions', function(done) {
		let failure = jest.fn();

		let successModule;
		let success = jest
			.fn()
			.mockImplementation(module => (successModule = module));

		DependencyBuilder.mockImplementation(() => {
			return {
				resolve: () => {
					return Promise.resolve({
						resolvedModules: [
							'isarray@1.0.0/index',
							'isobject@2.1.0/index',
						],
					});
				},
			};
		});

		loader.require(['isobject@2.1.0/index'], success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);

			expect(successModule.default).toBe(
				'isobject@2.1.0 depending on isarray@1.0.0'
			);

			done();
		}, 50);
	});

	it('should insert synchronous DOM script nodes', function(done) {
		let failure = jest.fn();
		let success = jest.fn();

		loader.require(['isobject@2.1.0/index'], success, failure);

		setTimeout(function() {
			document.scripts.forEach(script =>
				expect(script.async).toBe(false)
			);

			done();
		}, 50);
	});

	it('should pass correct dependencies when module and exports are requested', function(done) {
		let passedModule;
		let passedExports;

		loader.define('module', ['module', 'exports'], function(
			module,
			exports
		) {
			passedModule = module;
			passedExports = exports;
		});

		loader.require('module', function() {}, console.error);

		setTimeout(function() {
			expect(passedModule).toBeDefined();
			expect(passedModule).toHaveProperty('exports');
			expect(passedExports).toBeDefined();
			expect(passedModule.exports).toBe(passedExports);

			done();
		}, 50);
	});

	it('should work correctly when a module exports `false`', function(done) {
		let failure = jest.fn();

		let successModule;
		let success = jest
			.fn()
			.mockImplementation(module => (successModule = module));

		loader.define('module', ['module'], function(module) {
			module.exports = false;
		});

		loader.require('module', success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);
			expect(successModule).toBe(false);

			done();
		}, 50);
	});

	it('should work correctly when a module exports `null`', function(done) {
		let failure = jest.fn();

		let successModule;
		let success = jest
			.fn()
			.mockImplementation(module => (successModule = module));

		loader.define('module', ['module'], function(module) {
			module.exports = null;
		});

		loader.require('module', success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);
			expect(successModule).toBeNull();

			done();
		}, 50);
	});

	it('should work correctly when a module exports `undefined`', function(done) {
		let failure = jest.fn();

		let successModule;
		let success = jest
			.fn()
			.mockImplementation(module => (successModule = module));

		loader.define('module', ['module'], function(module) {
			module.exports = undefined;
		});

		loader.require('module', success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);
			expect(successModule).toBeUndefined();

			done();
		}, 50);
	});

	it('localRequire should not mix contexts (issue 140)', function(done) {
		let m2;

		loader.require('issue-140/m2/m2', _m2 => (m2 = _m2()), jest.fn());

		setTimeout(function() {
			expect(m2.standard).toBe('standard:a');
			expect(m2.local).toBe('local:a');
			expect(m2.mapped).toBe('mapped:a');

			done();
		}, 50);
	});

	it('should match module names without the version qualifier when ignoreModuleVersion is set to true (issue 146)', function(done) {
		let failure = jest.fn();
		let success = jest.fn();

		config.ignoreModuleVersion = true;

		loader.require('issue-146/ignoreModuleVersion', success, failure);

		setTimeout(function() {
			expect(failure.mock.calls).toHaveLength(0);
			expect(success.mock.calls).toHaveLength(1);

			done();
		}, 50);
	});

	describe('when working with anonymous modules', function() {
		beforeEach(function() {
			console.log = jest.fn();
			console.warn = jest.fn();

			Object.keys(require.cache).forEach(function(cache) {
				delete require.cache[cache];
			});

			config = {
				url: __dirname + '/fixture',
				basePath: '/modules3',
			};

			loader = new Loader(config, document);

			// This is needed for fixture modules to work
			global.require = Loader.prototype.require.bind(loader);
			global.define = Loader.prototype.define.bind(loader);
			global.define.amd = {};
		});

		afterEach(() => {
			console.log = log;
			console.warn = warn;
		});

		it('should load multiple anonymous modules', function(done) {
			let failure = jest.fn();
			let success = jest.fn();

			loader.require(['a', 'b', 'c'], success, failure);

			setTimeout(function() {
				expect(failure.mock.calls).toHaveLength(0);
				expect(success.mock.calls).toHaveLength(1);

				done();
			}, 50);
		});

		it('should load anonymous modules with anonymous dependencies', function(done) {
			let failure = jest.fn();
			let success = jest.fn();

			loader.require(['d'], success, failure);

			setTimeout(function() {
				expect(failure.mock.calls).toHaveLength(0);
				expect(success.mock.calls).toHaveLength(1);

				done();
			}, 50);
		});

		it('should load non-anonymous modules with anonymous dependencies', function(done) {
			let failure = jest.fn();
			let success = jest.fn();

			loader.require(['e'], success, failure);

			setTimeout(function() {
				expect(failure.mock.calls).toHaveLength(0);
				expect(success.mock.calls).toHaveLength(1);

				done();
			}, 50);
		});

		it('should load anonymous modules with non-anonymous dependencies', function(done) {
			let failure = jest.fn();
			let success = jest.fn();

			loader.require(['f'], success, failure);

			setTimeout(function() {
				expect(failure.mock.calls).toHaveLength(0);
				expect(success.mock.calls).toHaveLength(1);

				done();
			}, 50);
		});

		it('should mark anonymous modules', function() {
			let moduleName = 'foo';

			loader.define(function() {});
			loader.emit('scriptLoaded', [moduleName]);

			let modules = loader.getModules();

			expect(modules).toHaveProperty(moduleName);

			let module = modules[moduleName];

			expect(typeof module).toBe('object');
			expect(module.name).toBe(moduleName);
			expect(module.anonymous).toBe(true);
		});

		it('should prevent a mismatched anonymous module to override the implementation of another module', function(done) {
			let anonModuleImpl = function() {};
			loader.define(anonModuleImpl);

			let failure = jest.fn();
			let success = jest.fn();

			loader.require(['g'], success, failure);

			setTimeout(function() {
				loader.emit('scriptLoaded', ['g']);

				expect(failure.mock.calls).toHaveLength(0);
				expect(success.mock.calls).toHaveLength(1);

				let modules = loader.getModules();
				let module = modules['g'];

				expect(module.pendingImplementation).not.toBe(anonModuleImpl);

				done();
			}, 50);
		});
	});
});
