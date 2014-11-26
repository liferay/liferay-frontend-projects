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
    var modules = configParser.getModules();
    var conditionalModules = configParser.getConditionalModules();

    assert.ok(groups.chema);
    assert.ok(groups.ambrin);
    assert.ok(groups['default']);


  });
});
