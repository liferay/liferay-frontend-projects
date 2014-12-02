'use strict';

var assert = require('assert');
require('./fixture/common.js');

var config = require('./fixture/config.js');

describe('ConfigParser', function () {
    it('should create an instance of ConfigParser without existing data', function () {
        var configParser = new global.LoaderUtils.ConfigParser();

        assert.ok(configParser);

        var modules = configParser.getModules();
        var conditionalModules = configParser.getModules();

        assert.strictEqual(0, Object.keys(modules).length);
        assert.strictEqual(0, Object.keys(conditionalModules).length);
    });

    it('should add new module', function () {
        var configParser = new global.LoaderUtils.ConfigParser(config);

        configParser.addModule({
            name: 'aui-test1',
            dependencies: ['aui-base', 'aui-core'],
            path: 'aui-test1.js'
        });

        var modules = configParser.getModules();

        assert.ok(modules['aui-test1']);
    });

    it('should add conditional module', function () {
        var configParser = new global.LoaderUtils.ConfigParser();

        configParser.addModule({
            name: 'aui-chema-test2',
            dependencies: ['aui-base', 'aui-core'],
            path: 'aui-chema-test2.js',
            condition: {
                trigger: 'aui-nate',
                test: function () {
                    return true;
                }
            }
        });

        var modules = configParser.getConditionalModules();
        assert.ok(modules['aui-nate'].indexOf('aui-chema-test2') >= 0);
    });
});