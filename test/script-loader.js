'use strict';

global.__CONFIG__ = {
    url: __dirname + '/fixture/modules',
    basePath: '/',
    modules: {
        module1: {
            dependencies: [
                'module2',
                'module3'
            ]
        },
        module2: {
            dependencies: []
        },
        module3: {
            dependencies: []
        },
        module5: {
            dependencies: ['module6', 'module7', 'exports']
        },
        module6: {
            dependencies: ['module7', 'exports']
        },
        module7: {
            dependencies: ['exports']
        },
        moduleMissing: {
            dependencies: []
        },
        moduleCyclic1: {
            dependencies: ['moduleCyclic2']
        },
        moduleCyclic2: {
            dependencies: ['moduleCyclic1']
        },
    }
};

require('../dist/source/event-emitter.js');
require('../dist/source/script-loader.js');

var assert = require('assert');
var sinon = require('sinon');
require('./fixture/common.js');
require('./fixture/script.js');

describe('Loader', function () {
    it('should define a module without dependencies (except exports)', function (done) {
        var impl = sinon.spy(function(exports) {
            exports.pejJung = {};
        });

        var success = sinon.spy(function(module) {
            var modules = Loader.getModules();

            assert.ok(modules['pej-jung']);
            assert.strictEqual('pej-jung', module.name);
        });

        var failure = sinon.spy(function(error) {
            throw error;
        });

        Loader.define('pej-jung', ['exports'], impl)
            .then(success)
            .catch(failure);

        setTimeout(function() {
            assert(impl.calledOnce);
            assert(success.calledOnce);
            assert(failure.notCalled);

            done();
        }, 50);
    });

    it('should throw exception if module is being defined with not yet registered dependencies', function (done) {
        var impl = sinon.spy(function(exports) {
            exports.pejJung = {};
        });

        var failure = sinon.spy(function(error) {
            assert.ok(error);
        });

        Loader.define('pej-jung', ['non-existing-module', 'exports'], impl)
            .catch(failure);

        setTimeout(function() {
            assert(impl.notCalled);
            assert(failure.calledOnce);

            done();
        }, 50);
    });

    it('should define module with dependencies', function (done) {
        var aui123Impl = sinon.spy(function(exports) {
            exports.aui123 = {};
        });

        var pejJungImpl = sinon.spy(function(exports) {
            exports.pejJung = {};
        });

        var resultFun = sinon.spy(function(module) {});

        Loader.define('aui-123', ['exports'], aui123Impl)
            .then(function(module) {
                Loader.define('pej-jung', ['aui-123', 'exports'], pejJungImpl)
                .then(resultFun);
            });

        setTimeout(function() {
            assert.ok(aui123Impl.calledOnce);
            assert.ok(pejJungImpl.calledOnce);
            assert.ok(resultFun.calledOnce);

            done();
        }, 50);
    });

    it('should load already defined (manually) modules', function (done) {
        var failure = sinon.stub();
        var success = sinon.stub();

        Loader.require(['aui-123', 'pej-jung'], success, failure);

        setTimeout(function() {
            assert.ok(failure.notCalled);
            assert.ok(success.calledOnce);

            done();
        }, 50);
    });

    it('should load modules with misspelled names', function (done) {
        var failure = sinon.stub();
        var success = sinon.stub();

        Loader.require(['aui-1', 'aui2'], success, failure);

        setTimeout(function() {
            assert.ok(failure.notCalled);
            assert.ok(success.calledOnce);

            done();
        }, 50);
    });

    it('should load previously registered modules', function (done) {
        var failure = sinon.stub();
        var success = sinon.stub();

        Loader.require('module1', success, failure);

        setTimeout(function() {
            assert.ok(failure.notCalled);
            assert.ok(success.calledOnce);

            done();
        }, 50);
    });

    it('should fail on registered but not existing file', function (done) {
        var failure = sinon.stub();
        var success = sinon.stub();

        Loader.require('moduleMissing', success, failure);

        setTimeout(function() {
            assert.ok(failure.calledOnce);
            assert.ok(success.notCalled);

            done();
        }, 50);
    });

    it('should fail if dependencies cannot be resolved', function (done) {
        var failure = sinon.stub();
        var success = sinon.stub();

        Loader.require('moduleCyclic1', 'moduleCyclic1', success, failure);

        setTimeout(function() {
            assert.ok(failure.calledOnce);
            assert.ok(success.notCalled);

            done();
        }, 50);
    });

    it('should succeed if modules are coming out of order', function (done) {
        var failure = sinon.spy();
        var success = sinon.stub();

        Loader.require(['module5'], success, failure);
        Loader.require(['module6'], success, failure);
        Loader.require(['module7'], success, failure);

        setTimeout(function() {
            assert.ok(failure.notCalled);
            assert.ok(success.calledThrice);

            done();
        }, 50);
    });

    it('should ignore success and callback if not functions', function () {
        Loader.require(['module1'], null, null);
    });

    it('should return conditional modules', function () {
        var conditionalModules = Loader.getConditionalModules();

        assert.deepEqual([], conditionalModules);
    });
});