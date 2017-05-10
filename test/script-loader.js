'use strict';

require('./fixture/common.js');
require('./fixture/script.js');

var assert = require('chai').assert;
var sinon = require('sinon');

/* eslint-disable max-len,require-jsdoc,quote-props,no-invalid-this */
describe('Loader', function() {
	beforeEach(function() {
		Object.keys(require.cache).forEach(function(cache) {
			delete require.cache[cache];
		});

		global.__CONFIG__ = {
			url: __dirname + '/fixture',
			basePath: '/modules',
			maps: {
				liferay: 'liferay@1.0.0',
				liferay2: 'liferay@2.0.0',
			},
			modules: {
				module1: {
					dependencies: ['module2', 'module3'],
				},
				module2: {
					dependencies: [],
				},
				module3: {
					dependencies: [],
				},
				module5: {
					dependencies: ['module6', 'module7', 'exports'],
				},
				module6: {
					dependencies: ['module7', 'exports'],
				},
				module7: {
					dependencies: ['exports'],
				},
				moduleMissing: {
					dependencies: [],
				},
				moduleCyclic1: {
					dependencies: ['moduleCyclic2'],
				},
				moduleCyclic2: {
					dependencies: ['moduleCyclic1'],
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
			},
		};

		global.__CONFIG__.waitTimeout = 0;

		global.__CONFIG__.paths = {};

		require('../umd/config-parser.js');
		require('../umd/event-emitter.js');
		require('../umd/script-loader.js');
	});

	it('should add module to the configuration', function() {
		var moduleName = '_' + Math.random().toString();
		var modules = Loader.getModules();

		assert.notProperty(modules, moduleName);

		var module = Loader.addModule({
			name: moduleName,
			dependencies: [],
		});

		assert.property(modules, moduleName);
		assert.isObject(module);
		assert.propertyVal(module, 'name', moduleName);
	});

	it('should define a module without dependencies (except exports)', function(
		done
	) {
		var impl = sinon.spy(function(exports) {
			exports.pejJung = {};
		});

		Loader.define('pej-jung', ['exports'], impl);

		setTimeout(function() {
			assert(impl.notCalled);

			var modules = Loader.getModules();

			var module = modules['pej-jung'];

			assert.ok(module);
			assert.strictEqual('pej-jung', module.name);
			assert.strictEqual(module.pendingImplementation, impl);
			assert.strictEqual(module.requested, undefined);

			done();
		}, 50);
	});

	it('should discover missing dependencies of already defined modules', function() {
		var module1 = Math.random().toString();
		var dep1 = Math.random().toString();

		var module2 = Math.random().toString();
		var dep2 = Math.random().toString();

		Loader.define(module1, [dep1], function() {
			return 1;
		});
		Loader.define(module2, [dep2], function() {
			return 1;
		});

		var missingDeps = Loader._getMissingDependencies([module1, module2]);

		assert.isArray(missingDeps);
		assert.strictEqual(2, missingDeps.length);
		assert.sameMembers([dep1, dep2], missingDeps);
	});

	it('should resolve relative dependencies path in define', function() {
		var module = 'test/sub1/' + Math.random().toString();
		var depName = Math.random().toString();
		var dep = '../' + depName;

		Loader.define(module, [dep], function() {});

		var modules = Loader.getModules();

		assert.property(modules, module);
		assert.isArray(modules[module].dependencies);
		assert.strictEqual('test/' + depName, modules[module].dependencies[0]);
	});

	it('should not accept define with only one parameter', function() {
		assert.isUndefined(Loader.define(function() {}));
	});

	it('should not accept define with two parameters', function() {
		assert.isUndefined(Loader.define(['exports'], function() {}));
	});

	it('should define a module with name and without dependencies', function() {
		var module = Math.random().toString();

		var impl = function() {};

		Loader.define(module, impl);

		var modules = Loader.getModules();

		assert.property(modules, module);
		assert.isArray(modules[module].dependencies);
		assert.strictEqual(modules[module].pendingImplementation, impl);
		assert.sameMembers(['exports', 'module'], modules[module].dependencies);
	});

	it('should define itself as AMD compatible loader', function() {
		assert.property(global.define, 'amd');
		assert.isObject(global.define.amd);
	});

	it('should have a define.amd property', function() {
		assert.property(Loader.define, 'amd');
		assert.isObject(Loader.define.amd);
	});

	it('should register unregistered modules in require', function() {
		var module = Math.random().toString();

		Loader.require(module);
		var modules = Loader.getModules();

		assert.property(modules, module);
		assert.isObject(modules[module]);
		assert.property(modules[module], 'dependencies');
		assert.isArray(modules[module].dependencies);
	});

	it('should map modules in require', function() {
		var module = Math.random().toString();
		var alias = Math.random().toString();

		global.__CONFIG__.maps[module] = alias;

		Loader.require(module, [], function() {
			return 1;
		});
		var modules = Loader.getModules();

		assert.property(modules, alias);
	});

	it('should load already defined (manually) modules', function(done) {
		var failure = sinon.stub();
		var success = sinon.stub();

		Loader.require(['aui-123', 'pej-jung'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled);
			assert.isTrue(success.calledOnce);

			done();
		}, 50);
	});

	it('should load unregistered modules', function(done) {
		var one;
		var failure = sinon.stub();
		var success = sinon.spy(function(_one) {
			one = _one;
		});

		global.__CONFIG__.paths['one'] = '/modules2/one';
		global.__CONFIG__.paths['two'] = '/modules2/two';
		global.__CONFIG__.paths['three'] = '/modules2/three';

		Loader.require(['one'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled);
			assert.isTrue(success.calledOnce);
			assert.isFunction(one);

			done();
		}, 50);
	});

	it('should load previously registered modules', function(done) {
		var failure = sinon.stub();
		var success = sinon.stub();

		Loader.require('module1', success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled);
			assert.isTrue(success.calledOnce);

			done();
		}, 50);
	});

	it('should load module which implementation is an object', function(done) {
		var moduleName = Math.random().toString();

		Loader.addModule({
			name: 'impl_as_object',
			dependencies: ['exports'],
			path: '/modules2/impl_as_object.js',
		});

		var failure = sinon.stub();

		var implementation;
		var success = sinon.spy(function(impl) {
			implementation = impl;
		});

		Loader.require(['impl_as_object'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should not be called');
			assert.isTrue(success.calledOnce, 'Success should be called');
			assert.isObject(
				implementation,
				'The implementation should be an object'
			);
			assert.property(implementation, 'pesho');

			done();
		}, 50);
	});

	it('should fail on registered but not existing file', function(done) {
		var failure = sinon.stub();
		var success = sinon.stub();

		Loader.require('moduleMissing', success, failure);

		setTimeout(function() {
			assert.isTrue(failure.calledOnce);
			assert.isTrue(success.notCalled);

			done();
		}, 50);
	});

	it('should fail if there are cyclic dependencies', function(done) {
		var failure = sinon.stub();
		var success = sinon.stub();

		Loader.require('moduleCyclic1', 'moduleCyclic2', success, failure);

		setTimeout(function() {
			assert.isTrue(failure.calledOnce);
			assert.isTrue(success.notCalled);

			done();
		}, 50);
	});

	it('should succeed when requiring modules multiple times', function(done) {
		var failure = sinon.stub();
		var success = sinon.stub();

		Loader.require(['module5'], success, failure);
		Loader.require(['module6'], success, failure);
		Loader.require(['module7'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled);
			assert.isTrue(success.calledThrice);

			done();
		}, 50);
	});

	it('should ignore success and callback if not functions', function() {
		Loader.require(['module1'], null, null);
	});

	it('should return conditional modules', function() {
		var conditionalModules = Loader.getConditionalModules();

		assert.deepEqual({}, conditionalModules);
	});

	it('should load aliased modules', function(done) {
		var failure = sinon.stub();
		var success = sinon.stub();

		Loader.require(['liferay'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled);
			assert.isTrue(success.calledOnce);

			done();
		}, 50);
	});

	it('should load aliased modules with aliased dependencies', function(done) {
		var failure = sinon.stub();
		var success = sinon.stub();

		Loader.require(['liferay2'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should be not called');
			assert.isTrue(success.calledOnce, 'Success should be called');

			done();
		}, 50);
	});

	it('should load module with "exports" dependency', function(done) {
		var failure = sinon.stub();

		var successValue;
		var success = sinon.spy(function(val) {
			successValue = val;
		});

		Loader.require(['exports-dep'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should be not called');
			assert.isTrue(success.calledOnce, 'Success should be called');

			assert.isObject(successValue);
			assert.property(successValue, 'default');
			assert.isFunction(successValue.default);
			assert.strictEqual('alabala', successValue.default.name);

			done();
		}, 50);
	});

	it('should load module with "exports" dependency twice', function(done) {
		var failure = sinon.stub();

		var successValue;
		var success = sinon.spy(function(val) {
			successValue = val;
		});

		Loader.require(['exports-dep'], success, failure);
		Loader.require(['exports-dep'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should be not called');
			assert.isTrue(
				success.calledTwice,
				'Success should be called twice'
			);

			assert.isObject(successValue);
			assert.property(successValue, 'default');
			assert.isFunction(successValue.default);
			assert.strictEqual('alabala', successValue.default.name);

			done();
		}, 50);
	});

	it('should load module with "module" dependency', function(done) {
		var failure = sinon.stub();

		var successValue;
		var success = sinon.spy(function(val) {
			successValue = val;
		});

		Loader.require(['module-dep'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should be not called');
			assert.isTrue(success.calledOnce, 'Success should be called');

			assert.isFunction(successValue);
			assert.strictEqual('alabala', successValue.name);

			done();
		}, 50);
	});

	it('should load module with relative path', function(done) {
		var failure = sinon.stub();

		var successValue;
		var success = sinon.spy(function(val) {
			successValue = val;
		});

		Loader.require(['liferay/relative1'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should be not called');
			assert.isTrue(success.calledOnce, 'Success should be called');

			assert.isObject(successValue);

			done();
		}, 50);
	});

	it('should resolve the missing dependencies without multiple require calls', function(
		done
	) {
		Loader.require = sinon.spy(Loader.require);
		var failure = sinon.stub();
		var success = sinon.stub();

		Loader.require.call(
			Loader,
			['liferay@1.0.0/relative1'],
			success,
			failure
		);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should be not called');
			assert.isTrue(success.calledOnce, 'Success should be called');
			assert.isTrue(
				Loader.require.calledOnce,
				'Require should be called once'
			);

			done();
		}, 50);
	});

	it('should load module with mapped dependencies without multiple require calls', function(
		done
	) {
		Loader.require = sinon.spy(Loader.require);
		var failure = sinon.stub();
		var success = sinon.stub();

		Loader.require.call(Loader, ['liferay/mappeddeps'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should be not called');
			assert.isTrue(success.calledOnce, 'Success should be called');
			assert.isTrue(
				Loader.require.calledOnce,
				'Require should be called once'
			);

			done();
		}, 50);
	});

	it('should cancel a require in case of failure because of an empty module', function(
		done
	) {
		global.__CONFIG__.waitTimeout = 20;

		var failureError;
		var failure = sinon.spy(function(error) {
			failureError = error;
		});
		var success = sinon.stub();

		Loader.require(['liferay@1.0.0/empty'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.calledOnce, 'Failure should be called once');
			assert.isTrue(success.notCalled, 'Success should not be called');

			assert.instanceOf(failureError, Error);
			assert.property(failureError, 'dependencies');
			assert.property(failureError, 'mappedModules');
			assert.property(failureError, 'missingDependencies');
			assert.property(failureError, 'modules');

			done();
		}, 50);
	});

	it('should fail after a require timeout, but a valid module should still be loaded', function(
		done
	) {
		global.__CONFIG__.waitTimeout = 1;
		global.__CONFIG__.paths['delay'] = '/modules2/delay';

		var failureError;
		var failure = sinon.spy(function(error) {
			failureError = error;
		});
		var success = sinon.stub();

		Loader.require(['delay'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.calledOnce, 'Failure should be called');
			assert.property(failureError, 'modules');
			assert.isTrue(success.notCalled, 'Success should be not called');
			// Delay module adds "delay" property to global
			assert.strictEqual(1, global.delay);

			delete global.delay;
			done();
		}, 50);
	});

	it("should load modules which don't expose a define function", function(
		done
	) {
		Loader.addModule({
			dependencies: [],
			exports: '_',
			name: 'underscore',
			path: '/modules2/underscore.js',
		});

		var failure = sinon.spy(function(error) {
			console.error(error);
		});
		var success = sinon.stub();

		Loader.require(['underscore'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should not be called');
			assert.isTrue(success.calledOnce, 'Success should be called');
			assert.property(global, '_');

			var modules = Loader.getModules();
			assert.property(modules['underscore'], 'implementation');

			delete global['_'];
			done();
		}, 50);
	});

	it('should load modules which export multiple level variable', function(
		done
	) {
		Loader.addModule({
			dependencies: [],
			exports: 'jquery.labelauty.prop1',
			name: 'labelauty',
			path: '/modules2/labelauty.js',
		});

		var failure = sinon.spy(function(error) {
			console.error(error);
		});
		var success = sinon.stub();

		Loader.require(['labelauty'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should not be called');
			assert.isTrue(success.calledOnce, 'Success should be called');
			assert.property(global, 'jquery');
			assert.property(global.jquery, 'labelauty');
			assert.property(global.jquery.labelauty, 'prop1');

			var modules = Loader.getModules();
			assert.property(modules['labelauty'], 'implementation');

			delete global['jquery'];
			done();
		}, 50);
	});

	it("should load modules which don't expose a define function twice", function(
		done
	) {
		Loader.addModule({
			dependencies: [],
			exports: '_',
			name: 'underscore',
			path: '/modules2/underscore.js',
		});

		var failure = sinon.spy(function(error) {
			console.error(error);
		});
		var success = sinon.stub();

		Loader.require(['underscore'], success, failure);
		Loader.require(['underscore'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should not be called');
			assert.isTrue(
				success.calledTwice,
				'Success should be called twice'
			);
			assert.property(global, '_');

			var modules = Loader.getModules();
			assert.property(modules['underscore'], 'implementation');

			delete global['_'];
			done();
		}, 50);
	});

	it("should load modules which don't expose a define function twice and regular ones together", function(
		done
	) {
		Loader.addModule({
			dependencies: [],
			exports: '_',
			name: 'underscore',
			path: '/modules2/underscore.js',
		});

		Loader.addModule({
			dependencies: [],
			exports: '$',
			name: 'dollar',
			path: '/modules2/dollar.js',
		});

		var failure = sinon.spy(function(error) {
			console.error(error);
		});
		var success = sinon.stub();

		Loader.require('module1', success, failure);
		Loader.require(['underscore', 'dollar'], success, failure);
		Loader.require(['underscore'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should not be called');
			assert.isTrue(
				success.calledThrice,
				'Success should be called thrice'
			);
			assert.property(global, '_');
			assert.property(global, '$');

			var modules = Loader.getModules();
			assert.property(modules['underscore'], 'implementation');

			delete global['_'];
			delete global['$'];
			done();
		}, 50);
	});

	it('should not request module if added explicitly', function(done) {
		var module = {
			name: 'added_explicitly',
			dependencies: ['exports'],
			path: '/modules2/added_explicitly.js',
		};

		Loader.addModule(module);

		Loader.define(module.name, module.dependencies, function() {});

		var failure = sinon.stub();
		var success = sinon.stub();

		var origAppendChild = document.head.appendChild;

		document.head.appendChild = sinon.spy(document.head.appendChild);

		Loader.require('added_explicitly', success, failure);

		setTimeout(function() {
			assert.isTrue(
				document.head.appendChild.notCalled,
				"document.head.appendChild shouldn't be called"
			);
			assert.isTrue(failure.notCalled, 'Failure should be not called');
			assert.isTrue(success.calledOnce, 'Success should be called once');

			document.head.appendChild = origAppendChild;

			done();
		}, 50);
	});

	it('should load modules even when same module is requested second time with another module', function(
		done
	) {
		var failure = sinon.stub();
		var success = sinon.stub();

		Loader.require(['module3'], success, failure);
		Loader.require(['module3', 'module7'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should be not called');
			assert.isTrue(
				success.calledTwice,
				'Success should be called twice'
			);

			done();
		}, 50);
	});

	it('should implement local require inside module implementation function', function(
		done
	) {
		var failure = sinon.spy(function(error) {
			console.error(error);
		});
		var success = sinon.spy(function(module) {
			this.module = module;
		});

		Loader.require(['module-require'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should not be called');
			assert.isTrue(success.calledOnce, 'Success should be called once');
			assert.isTrue(
				success.module.resolved,
				'Local require should have resolved module1'
			);

			done();
		}, 50);
	});

	it('should implement localRequire.toUrl inside module implementation function', function(
		done
	) {
		var failure = sinon.spy(function(error) {
			console.error(error);
		});
		var success = sinon.spy(function(module) {
			this.module = module;
		});

		Loader.require(['module-require'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should not be called');
			assert.isTrue(success.calledOnce, 'Success should be called once');
			assert.isNotNull(
				success.module.resolvedUrl,
				'Resolved URL should be present'
			);

			done();
		}, 50);
	});

	it('should map configured paths when local require is invoked', function(
		done
	) {
		var failure = sinon.spy(function(error) {
			console.error(error);
		});
		var success = sinon.spy(function(module) {
			this.module = module;
		});

		Loader.require(['module-require-path'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should not be called');
			assert.isTrue(success.calledOnce, 'Success should be called once');
			assert.isTrue(
				success.module.resolved,
				'Local require should have resolved liferay'
			);

			done();
		}, 50);
	});

	it('should support relative paths in local require', function(done) {
		var failure = sinon.spy(function(error) {
			console.error(error);
		});
		var success = sinon.spy(function(module) {
			this.module = module;
		});

		Loader.require(['rel-path/module-require-rel-path'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should not be called');
			assert.isTrue(success.calledOnce, 'Success should be called once');
			assert.isTrue(
				success.module.resolvedDot,
				'Local require should have resolved ./ relative path'
			);
			assert.isTrue(
				success.module.resolvedDot2,
				'Local require should have resolved ../ relative path'
			);

			done();
		}, 50);
	});

	it('should fail when local require is called with an undeclared module', function(
		done
	) {
		var failure = sinon.spy(function(error) {
			console.error(error);
		});
		var success = sinon.spy(function(module) {
			this.module = module;
		});

		Loader.require(['module-require-fail'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should not be called');
			assert.isTrue(success.calledOnce, 'Success should be called once');
			assert.isDefined(
				success.module.error,
				'Local require should have NOT resolved the undeclared module'
			);
			assert.equal(
				success.module.error,
				'Error: Module "non-existent-module" has not been loaded yet for context: module-require-fail'
			);

			done();
		}, 50);
	});

	it('should implement async local require inside module implementation function', function(
		done
	) {
		var failure = sinon.spy(function(error) {
			console.error(error);
		});
		var success = sinon.spy(function(module) {
			this.module = module;
		});

		Loader.require(['module-require-async'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should not be called');
			assert.isTrue(success.calledOnce, 'Success should be called once');

			var resolved = success.module.resolved();

			assert.isFunction(
				resolved.module1.module1log,
				'Async local require should have resolved module1'
			);
			assert.isFunction(
				resolved.module2.module2log,
				'Async local require should have resolved module2'
			);

			done();
		}, 50);
	});

	it('should resolve dependency versions', function(done) {
		var failure = sinon.spy(function(error) {
			console.error(error);
		});
		var success = sinon.spy(function(module) {
			this.module = module;
		});

		Loader.require(['isobject@2.1.0/index'], success, failure);

		setTimeout(function() {
			assert.isTrue(failure.notCalled, 'Failure should not be called');
			assert.isTrue(success.calledOnce, 'Success should be called once');
			assert.equal(
				success.module.default,
				'isobject@2.1.0 depending on isarray@1.0.0'
			);

			done();
		}, 50);
	});

	describe('when working with anonymous modules', function() {
		beforeEach(function() {
			Object.keys(require.cache).forEach(function(cache) {
				delete require.cache[cache];
			});

			global.__CONFIG__ = {
				url: __dirname + '/fixture',
				basePath: '/modules3',
			};

			Object.keys(require.cache).forEach(function(cache) {
				delete require.cache[cache];
			});

			require('../umd/config-parser.js');
			require('../umd/event-emitter.js');
			require('../umd/script-loader.js');
		});

		it('should load multiple anonymous modules', function(done) {
			var failure = sinon.stub();
			var success = sinon.stub();

			Loader.require(['a', 'b', 'c'], success, failure);

			setTimeout(function() {
				assert.isTrue(
					failure.notCalled,
					'Failure should be not called'
				);
				assert.isTrue(
					success.calledOnce,
					'Success should be called once'
				);

				done();
			}, 50);
		});

		it('should load anonymous modules with anonymous dependencies', function(
			done
		) {
			var failure = sinon.stub();
			var success = sinon.stub();

			Loader.require(['d'], success, failure);

			setTimeout(function() {
				assert.isTrue(
					failure.notCalled,
					'Failure should be not called'
				);
				assert.isTrue(
					success.calledOnce,
					'Success should be called once'
				);

				done();
			}, 50);
		});

		it('should load non-anonymous modules with anonymous dependencies', function(
			done
		) {
			var failure = sinon.stub();
			var success = sinon.stub();

			Loader.require(['e'], success, failure);

			setTimeout(function() {
				assert.isTrue(
					success.calledOnce,
					'Success should be called once'
				);
				assert.isTrue(
					failure.notCalled,
					'Failure should not be called'
				);

				done();
			}, 50);
		});

		it('should load anonymous modules with non-anonymous dependencies', function(
			done
		) {
			var failure = sinon.stub();
			var success = sinon.stub();

			Loader.require(['f'], success, failure);

			setTimeout(function() {
				assert.isTrue(
					failure.notCalled,
					'Failure should be not called'
				);
				assert.isTrue(
					success.calledOnce,
					'Success should be called once'
				);

				done();
			}, 50);
		});

		it('should mark anonymous modules', function() {
			var moduleName = 'foo';

			Loader.define(function() {});
			Loader.emit('scriptLoaded', [moduleName]);
			var modules = Loader.getModules();

			assert.property(modules, moduleName);

			var module = modules[moduleName];
			assert.isObject(module);
			assert.propertyVal(module, 'name', moduleName);
			assert.propertyVal(module, 'anonymous', true);
		});

		it('should prevent a mismatched anonymous module to override the implementation of another module', function(
			done
		) {
			var anonModuleImpl = function() {};
			Loader.define(anonModuleImpl);

			var failure = sinon.stub();
			var success = sinon.stub();

			Loader.require(['g'], success, failure);

			setTimeout(function() {
				Loader.emit('scriptLoaded', ['g']);
				assert.isTrue(
					failure.notCalled,
					'Failure should be not called'
				);
				assert.isTrue(
					success.calledOnce,
					'Success should be called once'
				);

				var modules = Loader.getModules();
				var module = modules['g'];
				assert.notStrictEqual(
					module.pendingImplementation,
					anonModuleImpl
				);

				done();
			}, 50);
		});
	});
});
