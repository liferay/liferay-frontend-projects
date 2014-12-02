'use strict';

var assert = require('assert');
require('./fixture/common.js');

var config = require('./fixture/config.js');
var configParser = new global.LoaderUtils.ConfigParser(config);

describe('URLBuilder', function () {
    it('should create URL for module with path', function () {
        var urlBuilder = new global.LoaderUtils.URLBuilder(configParser);

        var url = urlBuilder.build(['aui-core']);

        assert.strictEqual(url.length, 1);

        assert.strictEqual(url[0], 'http://localhost:3000/combo?/modules/aui-core.js');
    });

    it('should create URL for module with full path', function () {
        var urlBuilder = new global.LoaderUtils.URLBuilder(configParser);

        var url = urlBuilder.build(['aui-base']);

        assert.strictEqual(url.length, 1);

        assert.strictEqual(url[0], 'http://localhost:8081/modules/aui-base.js');
    });

    it('should create url for module when combine set to false', function () {
        var configParser = new global.LoaderUtils.ConfigParser({
            'url': 'http://localhost:3000/modules',
            'basePath': '/base',
            'combine': false,
            'modules': {
                'aui-base': {
                    'dependencies': [],
                    'path': 'aui-base.js'
                }
            }
        });

        var urlBuilder = new global.LoaderUtils.URLBuilder(configParser);

        var url = urlBuilder.build(['aui-base']);

        assert.strictEqual(url.length, 1);

        assert.strictEqual(url[0], 'http://localhost:3000/modules/base/aui-base.js');
    });
});