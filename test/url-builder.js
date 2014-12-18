'use strict';

var assert = require('assert');
require('./fixture/common.js');

var config = require('./fixture/config.js');
var configParser = new global.ConfigParser(config);

describe('URLBuilder', function () {
    it('should create URL for module with path', function () {
        var urlBuilder = new global.URLBuilder(configParser);

        var url = urlBuilder.build(['aui-core']);

        assert.strictEqual(url.length, 1);

        assert.strictEqual(url[0], 'http://localhost:3000/combo?/modules/aui-core.js');
    });

    it('should create URL for module with full path', function () {
        var urlBuilder = new global.URLBuilder(configParser);

        var url = urlBuilder.build(['aui-base']);

        assert.strictEqual(url.length, 1);

        assert.strictEqual(url[0], 'http://localhost:8080/demo/modules/aui-base.js');
    });

    it('should create url for module when combine set to false', function () {
        var configParser = new global.ConfigParser({
            'url': 'http://localhost:3000/modules',
            'basePath': '/base',
            'combine': false,
            'modules': {
                'aui-base': {
                    'dependencies': [],
                    'path': 'aui-base.js'
                },
                'aui-core.js': {
                    'dependencies': []
                }
            }
        });

        var urlBuilder = new global.URLBuilder(configParser);

        var url = urlBuilder.build(['aui-base', 'aui-core.js']);

        assert.strictEqual(url.length, 2);

        assert.strictEqual(url[0], 'http://localhost:3000/modules/base/aui-base.js');
    });

    it('should create url for modules with external URLs', function () {
        var configParser = new global.ConfigParser({
            'url': 'http://localhost:3000/modules',
            'basePath': '/base',
            'modules': {
                'https://code.jquery.com/ui/1.11.2/jquery-ui.min.js': {
                    'dependencies': []
                },
                'jquery-2.1.2': {
                    'dependencies': [],
                    'path': 'http://code.jquery.com/jquery-2.1.2.min.js'
                },
                '//code.jquery.com/jquery-1.11.2.min.js': {
                    'dependencies': []
                }
            }
        });

        var urlBuilder = new global.URLBuilder(configParser);

        var url = urlBuilder.build([
            'https://code.jquery.com/ui/1.11.2/jquery-ui.min.js',
            'jquery-2.1.2',
            '//code.jquery.com/jquery-1.11.2.min.js'
            ]);

        assert.strictEqual(url.length, 3);

        assert.strictEqual(url[0], 'https://code.jquery.com/ui/1.11.2/jquery-ui.min.js');
        assert.strictEqual(url[1], 'http://code.jquery.com/jquery-2.1.2.min.js');
        assert.strictEqual(url[2], '//code.jquery.com/jquery-1.11.2.min.js');
    });
});