'use strict';

var assert = require('chai').assert;
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
                },
                'www.mydomain.com/crap.js': {
                    'dependencies': []
                }
            }
        });

        var urlBuilder = new global.URLBuilder(configParser);

        var url = urlBuilder.build(['https://code.jquery.com/ui/1.11.2/jquery-ui.min.js', 'jquery-2.1.2', '//code.jquery.com/jquery-1.11.2.min.js', 'www.mydomain.com/crap.js']);

        assert.strictEqual(url.length, 4);

        assert.strictEqual(url[0], 'https://code.jquery.com/ui/1.11.2/jquery-ui.min.js');
        assert.strictEqual(url[1], 'http://code.jquery.com/jquery-2.1.2.min.js');
        assert.strictEqual(url[2], '//code.jquery.com/jquery-1.11.2.min.js');
        assert.strictEqual(url[3], 'www.mydomain.com/crap.js');
    });

    it('should not replace parts of path', function () {
        var configParser = new global.ConfigParser({
            'url': 'http://localhost:3000/modules',
            'basePath': '/base',
            'paths': {
                'jquery': 'http://code.jquery.com/jquery-2.1.3.min.js',
                'aui': 'html/js'
            },
            'modules': {
                'jquery': {
                    'dependencies': []
                },
                'aui': {
                    'dependencies': []
                },
                'aui/js/loader.js': {
                    'dependencies': []
                },
                'test/aui/js/aui/loader.js': {
                    'dependencies': []
                }
            }
        });

        var urlBuilder = new global.URLBuilder(configParser);

        var url = urlBuilder.build(['jquery', 'aui', 'aui/js/loader.js', 'test/aui/js/aui/loader.js']);

        assert.strictEqual(url.length, 4);

        assert.strictEqual(url[0], 'http://code.jquery.com/jquery-2.1.3.min.js');
        assert.strictEqual(url[1], 'http://localhost:3000/modules/base/html/js.js');
        assert.strictEqual(url[2], 'http://localhost:3000/modules/base/html/js/js/loader.js');
        assert.strictEqual(url[3], 'http://localhost:3000/modules/base/test/aui/js/aui/loader.js');
    });

    it('should not add basePath when module has absolute url', function() {
        var configParser = new global.ConfigParser({
            'url': 'http://localhost:3000/modules?',
            'combine': true,
            'basePath': '/base',
            'modules': {
                'jquery': {
                    'dependencies': [],
                    'path': '/jquery'
                },
                'underscore': {
                    'dependencies': [],
                    'path': '/underscore'
                }
            }
        });

        var urlBuilder = new global.URLBuilder(configParser);

        var url = urlBuilder.build(['jquery', 'underscore']);

        assert.strictEqual(1, url.length);
        assert.strictEqual(url[0], 'http://localhost:3000/modules?/jquery.js&/underscore.js');
    });

    it('should not add trailing slash if base is an empty string', function () {
        var configParser = new global.ConfigParser({
            'url': 'http://localhost:3000/modules?',
            'basePath': '',
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

        assert.strictEqual(url[0], 'http://localhost:3000/modules?aui-base.js');
        assert.strictEqual(url[1], 'http://localhost:3000/modules?aui-core.js');
    });

    it('should not add trailing slash if base is an empty string and combine is true', function () {
        var configParser = new global.ConfigParser({
            'url': 'http://localhost:3000/modules?',
            'basePath': '',
            'combine': true,
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

        assert.strictEqual(url.length, 1);

        assert.strictEqual(url[0], 'http://localhost:3000/modules?aui-base.js&aui-core.js');
    });

    it('should combine modules with and without absolute url', function() {
        var configParser = new global.ConfigParser({
            'url': 'http://localhost:3000/modules?',
            'combine': true,
            'basePath': '/base',
            'modules': {
                'jquery': {
                    'dependencies': [],
                    'path': '/jquery'
                },
                'yui': {
                    'dependencies': [],
                    'path': '/yui'
                },
                'underscore': {
                    'dependencies': [],
                    'path': 'underscore'
                },
                'lodash': {
                    'dependencies': [],
                    'path': 'lodash'
                }
            }
        });

        var urlBuilder = new global.URLBuilder(configParser);

        var url = urlBuilder.build(['jquery', 'underscore', 'yui', 'lodash']);

        assert.strictEqual(2, url.length);
        assert.sameMembers(['http://localhost:3000/modules?/jquery.js&/yui.js', 'http://localhost:3000/modules?/base/underscore.js&/base/lodash.js'], url);
    });
});