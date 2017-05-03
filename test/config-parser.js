'use strict';

var assert = require('chai').assert;
require('./fixture/common.js');

var config = require('./fixture/config.js');

describe('ConfigParser', function() {
    it('should create an instance of ConfigParser without existing data', function() {
        var configParser = new global.ConfigParser();

        assert.ok(configParser);

        var modules = configParser.getModules();
        var conditionalModules = configParser.getModules();

        assert.strictEqual(0, Object.keys(modules).length);
        assert.strictEqual(0, Object.keys(conditionalModules).length);
    });

    it('should add new module', function() {
        var configParser = new global.ConfigParser(config);

        var addedModule = configParser.addModule({
            name: 'aui-test1',
            dependencies: ['aui-base', 'aui-core'],
            path: 'aui-test1.js'
        });

        var modules = configParser.getModules();

        assert.ok(modules['aui-test1']);
        assert.strictEqual(addedModule, modules['aui-test1']);
    });

    it('should overwrite the properties of an existing module', function() {
        var configParser = new global.ConfigParser(config);

        configParser.addModule({
            name: 'aui-test1',
            dependencies: ['aui-base', 'aui-core'],
            path: 'aui-test1.js',
            testMapk: true
        });

        configParser.addModule({
            name: 'aui-test1',
            dependencies: ['aui-base', 'aui-core']
        });

        var modules = configParser.getModules();

        var moduleDefinition = modules['aui-test1'];

        assert.propertyVal(moduleDefinition, 'testMapk', true);
        assert.propertyVal(moduleDefinition, 'path', 'aui-test1.js');
    });

    it('should add conditional module', function() {
        var configParser = new global.ConfigParser();

        configParser.addModule({
            name: 'aui-chema-test2',
            dependencies: ['aui-base', 'aui-core'],
            path: 'aui-chema-test2.js',
            condition: {
                trigger: 'aui-nate',
                test: function() {
                    return true;
                }
            }
        });

        var modules = configParser.getConditionalModules();
        assert.ok(modules['aui-nate'].indexOf('aui-chema-test2') >= 0);
    });

    it('should map a module to its alias', function() {
        var configParser = new global.ConfigParser();

        configParser.addModule({
            name: 'liferay@1.0.0'
        });

        configParser._config = {
            maps: {
                liferay: 'liferay@1.0.0'
            }
        };

        assert.strictEqual('liferay@1.0.0', configParser.mapModule('liferay'));
    });

    it('should respect "exactMatch" mappings', function() {
        var configParser = new global.ConfigParser();

        configParser.addModule({
            name: 'liferay@1.0.0/index'
        });

        configParser._config = {
            maps: {
                'liferay@1.0.0': {value: 'liferay@1.0.0/index', exactMatch: true}
            }
        };

        assert.strictEqual('liferay@1.0.0/index', configParser.mapModule('liferay@1.0.0'));
        assert.strictEqual('liferay@1.0.0/index', configParser.mapModule('liferay@1.0.0/index'));
    });

    it('should map an array of modules to their aliases', function() {
        var configParser = new global.ConfigParser();

        configParser.addModule({
            name: 'liferay@1.0.0'
        });

        configParser.addModule({
            name: 'liferay@2.0.0'
        });

        configParser._config = {
            maps: {
                liferay: 'liferay@1.0.0',
                liferay2: 'liferay@2.0.0'
            }
        };

        assert.sameMembers(['liferay@1.0.0', 'liferay@2.0.0'], configParser.mapModule(['liferay', 'liferay2']));
    });

    it('should map a module via a mapping function', function() {
        var configParser = new global.ConfigParser();

        configParser._config = {
            maps: {
                '*': function(name) {
                    return name + 'test';
                }
            }
        };

        assert.sameMembers(['liferaytest', 'liferay2test'], configParser.mapModule(['liferay', 'liferay2']));
    });

    it('should ignore a mapping function if a more specific module mapping exists', function() {
        var configParser = new global.ConfigParser();

        configParser._config = {
            maps: {
                liferay: 'liferay@1.0.0',
                '*': function(name) {
                    return name + 'test';
                }
            }
        };

        assert.sameMembers(['liferay@1.0.0', 'liferay2test'], configParser.mapModule(['liferay', 'liferay2']));
    });

    it('should apply exactMatches first', function() {
        var configParser = new global.ConfigParser();

        configParser.addModule({
            name: 'liferay@1.0.0/index'
        });

        configParser._config = {
            maps: {
                'liferay': 'liferay@2.0.0',
                'liferay/index': {value: 'liferay@1.0.0/index', exactMatch: true}
            }
        };

        assert.strictEqual('liferay@1.0.0/index', configParser.mapModule('liferay/index'));
        assert.strictEqual('liferay@2.0.0/main', configParser.mapModule('liferay/main'));
        assert.strictEqual('liferay@2.0.0', configParser.mapModule('liferay'));
        assert.strictEqual('liferayX', configParser.mapModule('liferayX'));
    });
});
