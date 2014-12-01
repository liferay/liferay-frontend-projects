'use strict';

var assert = require('assert');
require('./fixture/common.js');

var config = require('./fixture/config.js');
var configParser = new global.LoaderUtils.ConfigParser(config);

describe('URLBuilder', function () {
    it('should create URL for module with path from the default group', function () {
        var urlBuilder = new global.LoaderUtils.URLBuilder(configParser);

        var url = urlBuilder.build(['aui-core']);

        assert.strictEqual(url.length, 1);

        assert.strictEqual(url[0], 'http://localhost:3000/combo?/modules/aui-core.js');
    });

    it('should create URL for module with full path from the default group', function () {
        var urlBuilder = new global.LoaderUtils.URLBuilder(configParser);

        var url = urlBuilder.build(['aui-base']);

        assert.strictEqual(url.length, 1);

        assert.strictEqual(url[0], 'http://localhost:8081/modules/aui-base.js');
    });

    it('should create URL for module with full path from other group than default', function () {
        var urlBuilder = new global.LoaderUtils.URLBuilder(configParser);

        var url = urlBuilder.build(['aui-ambrin-group-test3']);

        assert.strictEqual(url.length, 1);

        assert.strictEqual(url[0], 'http://localhost:3000/combo?/modules/ambrin/aui-ambrin-group-test3.js');
    });

    it('should create URL for modules from different groups', function () {
        var urlBuilder = new global.LoaderUtils.URLBuilder(configParser);

        var url = urlBuilder.build(['aui-ambrin-group-test3', 'aui-chema-group-test1', 'aui-autocomplete']);

        assert.strictEqual(url.length, 3);

        assert.strictEqual(url[0], 'http://localhost:3000/combo?/modules/ambrin/aui-ambrin-group-test3.js');
        assert.strictEqual(url[1], 'http://localhost:3000/combo?/modules/chema/aui-chema-group-test1.js');
        assert.strictEqual(url[2], 'http://localhost:3000/combo?/modules/aui-autocomplete.js');
    });

    it('should create url for module from group with combine set to false', function () {
        var urlBuilder = new global.LoaderUtils.URLBuilder(configParser);

        var url = urlBuilder.build(['aui-unit-group-test1']);

        assert.strictEqual(url.length, 1);

        assert.strictEqual(url[0], 'http://localhost:3000/combo/modules/unit/aui-unit-group-test1.js');
    });

    it('should create url for module from group with combine set to false and without base path', function () {
        var urlBuilder = new global.LoaderUtils.URLBuilder(configParser);

        var url = urlBuilder.build(['aui-unit2-group-test1']);

        assert.strictEqual(url.length, 1);

        assert.strictEqual(url[0], 'http://localhost:3000/combo/modules/aui-unit2-group-test1.js');
    });

    it('should create url for module from group with combine set to true and without base path', function () {
        var urlBuilder = new global.LoaderUtils.URLBuilder(configParser);

        var url = urlBuilder.build(['aui-unit3-group-test1']);

        assert.strictEqual(url.length, 1);

        assert.strictEqual(url[0], 'http://localhost:3000/combo?/modules/aui-unit3-group-test1.js');
    });
});