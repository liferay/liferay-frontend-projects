'use strict';

var assert = require('assert');
require('./fixture/common.js');

var config = require('./fixture/config.js');

describe('ConfigParser', function() {
  it('should create an instance of ConfigParser without existing data', function() {
    var configParser = new global.LoaderUtils.ConfigParser();

    assert.ok(configParser);

    var groups = configParser.getGroups();
    var modules = configParser.getModules();
    var conditionalModules = configParser.getModules();

    assert.strictEqual(1, Object.keys(groups).length);
    assert.ok(groups['default']);

    assert.strictEqual(0, Object.keys(modules).length);
    assert.strictEqual(0, Object.keys(conditionalModules).length);
  });

  it('should create groups from existing data', function() {
    var configParser = new global.LoaderUtils.ConfigParser(config);

    assert.ok(configParser);

    var groups = configParser.getGroups();

    assert.ok(groups.chema);
    assert.ok(groups.ambrin);
    assert.ok(groups['default']);
  });

  it('should add new group', function() {
    var configParser = new global.LoaderUtils.ConfigParser(config);

    configParser.addGroup({
        combine: true,
        url: 'http://localhost:3000/combo',
        basePath: '/modules/group1',
        modules: {
            'aui-group1-test1': {
                'dependencies': [
                    'aui-base',
                    'aui-core'
                ],
                'path': 'aui-group1-test1.js'
            },
            'aui-group1-test2': {
                'dependencies': [
                    'aui-plugin-base'
                ],
                'path': 'aui-group1-test2.js'
            }
        },
        name: 'group1'
    });

    var groups = configParser.getGroups();
    var modules = configParser.getModules();

    assert.ok(groups.group1);
    assert.ok(modules['aui-group1-test1']);
    assert.ok(modules['aui-group1-test2']);
  });

  it('should add module to the default group', function() {
    var configParser = new global.LoaderUtils.ConfigParser(config);

    configParser.addModule({
        name: 'aui-test1',
        dependencies: [
            'aui-base',
            'aui-core'
        ],
        path: 'aui-test1.js'
    });

    var modules = configParser.getModules();

    assert.ok(modules['aui-test1']);
  });

  it('should add module to chema group', function() {
    var configParser = new global.LoaderUtils.ConfigParser(config);

    configParser.addModule({
        name: 'aui-chema-test1',
        dependencies: [
            'aui-base',
            'aui-core'
        ],
        path: 'aui-chema-test1.js',
        group: 'chema'
    });

    var modules = configParser.getModules();
    var chemaModule = modules['aui-chema-test1'];

    assert.strictEqual(chemaModule.group, 'chema');
  });

  it('should add conditional module', function() {
    var configParser = new global.LoaderUtils.ConfigParser();

    configParser.addModule({
        name: 'aui-chema-test2',
        dependencies: [
            'aui-base',
            'aui-core'
        ],
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
});
