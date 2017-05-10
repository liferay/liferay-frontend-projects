'use strict';

var assert = require('chai').assert;
require('./fixture/common.js');

var config = require('./fixture/config.js');
var configParser = new global.ConfigParser(config);

describe('URLBuilder', function() {
	it('should create URL for module with path', function() {
		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build(['aui-core']);

		assert.strictEqual(modulesURL.length, 1);

		assert.strictEqual(
			modulesURL[0].url,
			'http://localhost:3000/combo?/modules/aui-core.js'
		);
		assert.sameMembers(modulesURL[0].modules, ['aui-core']);
	});

	it('should append a trailing .js extension if the module path does not have one', function() {
		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build(['module']);

		assert.strictEqual(modulesURL.length, 1);

		assert.strictEqual(
			modulesURL[0].url,
			'http://localhost:3000/combo?/modules/module/src/module.js'
		);
		assert.sameMembers(modulesURL[0].modules, ['module']);
	});

	it('should not append the trailing .js extension if the module path already ends in .js', function() {
		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build(['module.js']);

		assert.strictEqual(modulesURL.length, 1);

		assert.strictEqual(
			modulesURL[0].url,
			'http://localhost:3000/combo?/modules/module.js/src/module.js'
		);
		assert.sameMembers(modulesURL[0].modules, ['module.js']);
	});

	it('should create URL for module with full path', function() {
		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build(['aui-base']);

		assert.strictEqual(modulesURL.length, 1);

		assert.strictEqual(
			modulesURL[0].url,
			'http://localhost:8080/demo/modules/aui-base.js'
		);
		assert.sameMembers(modulesURL[0].modules, ['aui-base']);
	});

	it('should create url for module when combine set to false', function() {
		var configParser = new global.ConfigParser({
			url: 'http://localhost:3000/modules',
			basePath: '/base',
			combine: false,
			modules: {
				'aui-base': {
					dependencies: [],
					path: 'aui-base.js',
				},
				'aui-core.js': {
					dependencies: [],
				},
			},
		});

		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build(['aui-base', 'aui-core.js']);

		assert.strictEqual(modulesURL.length, 2);

		assert.strictEqual(
			modulesURL[0].url,
			'http://localhost:3000/modules/base/aui-base.js'
		);
		assert.sameMembers(modulesURL[0].modules, ['aui-base']);

		assert.strictEqual(
			modulesURL[1].url,
			'http://localhost:3000/modules/base/aui-core.js'
		);
		assert.sameMembers(modulesURL[1].modules, ['aui-core.js']);
	});

	it("should map module's path via function", function() {
		var configParser = new global.ConfigParser({
			modules: {
				b: {
					dependencies: ['a'],
				},
				a: {
					dependencies: [],
				},
			},
			paths: {
				'*': function(module) {
					return 'https://a.com/' + module + '.js';
				},
			},
		});

		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build(['a', 'b']);

		assert.strictEqual(modulesURL.length, 2);

		assert.strictEqual(modulesURL[0].url, 'https://a.com/a.js');
		assert.sameMembers(modulesURL[0].modules, ['a']);

		assert.strictEqual(modulesURL[1].url, 'https://a.com/b.js');
		assert.sameMembers(modulesURL[1].modules, ['b']);
	});

	it('should create url for modules with external URLs', function() {
		var configParser = new global.ConfigParser({
			url: 'http://localhost:3000/modules',
			basePath: '/base',
			modules: {
				'https://code.jquery.com/ui/1.11.2/jquery-ui.min.js': {
					dependencies: [],
				},
				'jquery-2.1.2': {
					dependencies: [],
					path: 'http://code.jquery.com/jquery-2.1.2.min.js',
				},
				'//code.jquery.com/jquery-1.11.2.min.js': {
					dependencies: [],
				},
				'www.mydomain.com/crap.js': {
					dependencies: [],
				},
			},
		});

		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build([
			'https://code.jquery.com/ui/1.11.2/jquery-ui.min.js',
			'jquery-2.1.2',
			'//code.jquery.com/jquery-1.11.2.min.js',
			'www.mydomain.com/crap.js',
		]);

		assert.strictEqual(modulesURL.length, 4);

		assert.strictEqual(
			modulesURL[0].url,
			'https://code.jquery.com/ui/1.11.2/jquery-ui.min.js'
		);
		assert.sameMembers(modulesURL[0].modules, [
			'https://code.jquery.com/ui/1.11.2/jquery-ui.min.js',
		]);

		assert.strictEqual(
			modulesURL[1].url,
			'http://code.jquery.com/jquery-2.1.2.min.js'
		);
		assert.sameMembers(modulesURL[1].modules, ['jquery-2.1.2']);

		assert.strictEqual(
			modulesURL[2].url,
			'//code.jquery.com/jquery-1.11.2.min.js'
		);
		assert.sameMembers(modulesURL[2].modules, [
			'//code.jquery.com/jquery-1.11.2.min.js',
		]);

		assert.strictEqual(modulesURL[3].url, 'www.mydomain.com/crap.js');
		assert.sameMembers(modulesURL[3].modules, ['www.mydomain.com/crap.js']);
	});

	it('should not replace parts of path', function() {
		var configParser = new global.ConfigParser({
			url: 'http://localhost:3000/modules',
			basePath: '/base',
			paths: {
				jquery: 'http://code.jquery.com/jquery-2.1.3.min.js',
				aui: 'html/js',
			},
			modules: {
				jquery: {
					dependencies: [],
				},
				aui: {
					dependencies: [],
				},
				'aui/js/loader.js': {
					dependencies: [],
				},
				'test/aui/js/aui/loader.js': {
					dependencies: [],
				},
			},
		});

		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build([
			'jquery',
			'aui',
			'aui/js/loader.js',
			'test/aui/js/aui/loader.js',
		]);

		assert.strictEqual(modulesURL.length, 4);

		assert.strictEqual(
			modulesURL[0].url,
			'http://code.jquery.com/jquery-2.1.3.min.js'
		);
		assert.sameMembers(modulesURL[0].modules, ['jquery']);

		assert.strictEqual(
			modulesURL[1].url,
			'http://localhost:3000/modules/base/html/js.js'
		);
		assert.sameMembers(modulesURL[1].modules, ['aui']);

		assert.strictEqual(
			modulesURL[2].url,
			'http://localhost:3000/modules/base/html/js/js/loader.js'
		);
		assert.sameMembers(modulesURL[2].modules, ['aui/js/loader.js']);

		assert.strictEqual(
			modulesURL[3].url,
			'http://localhost:3000/modules/base/test/aui/js/aui/loader.js'
		);
		assert.sameMembers(modulesURL[3].modules, [
			'test/aui/js/aui/loader.js',
		]);
	});

	it('should not add basePath when module has absolute url', function() {
		var configParser = new global.ConfigParser({
			url: 'http://localhost:3000/modules?',
			combine: true,
			basePath: '/base',
			modules: {
				jquery: {
					dependencies: [],
					path: '/jquery',
				},
				underscore: {
					dependencies: [],
					path: '/underscore',
				},
			},
		});

		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build(['jquery', 'underscore']);

		assert.strictEqual(1, modulesURL.length);
		assert.strictEqual(
			modulesURL[0].url,
			'http://localhost:3000/modules?/jquery.js&/underscore.js'
		);
		assert.sameMembers(modulesURL[0].modules, ['jquery', 'underscore']);
	});

	it('should not add trailing slash if base is an empty string', function() {
		var configParser = new global.ConfigParser({
			url: 'http://localhost:3000/modules?',
			basePath: '',
			combine: false,
			modules: {
				'aui-base': {
					dependencies: [],
					path: 'aui-base.js',
				},
				'aui-core.js': {
					dependencies: [],
				},
			},
		});

		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build(['aui-base', 'aui-core.js']);

		assert.strictEqual(modulesURL.length, 2);

		assert.strictEqual(
			modulesURL[0].url,
			'http://localhost:3000/modules?aui-base.js'
		);
		assert.sameMembers(modulesURL[0].modules, ['aui-base']);

		assert.strictEqual(
			modulesURL[1].url,
			'http://localhost:3000/modules?aui-core.js'
		);
		assert.sameMembers(modulesURL[1].modules, ['aui-core.js']);
	});

	it('should not add trailing slash if base is an empty string and combine is true', function() {
		var configParser = new global.ConfigParser({
			url: 'http://localhost:3000/modules?',
			basePath: '',
			combine: true,
			modules: {
				'aui-base': {
					dependencies: [],
					path: 'aui-base.js',
				},
				'aui-core.js': {
					dependencies: [],
				},
			},
		});

		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build(['aui-base', 'aui-core.js']);

		assert.strictEqual(modulesURL.length, 1);

		assert.strictEqual(
			modulesURL[0].url,
			'http://localhost:3000/modules?aui-base.js&aui-core.js'
		);
		assert.sameMembers(modulesURL[0].modules, ['aui-base', 'aui-core.js']);
	});

	it('should combine modules with and without absolute url', function() {
		var configParser = new global.ConfigParser({
			url: 'http://localhost:3000/modules?',
			combine: true,
			basePath: '/base',
			modules: {
				jquery: {
					dependencies: [],
					path: '/jquery',
				},
				yui: {
					dependencies: [],
					path: '/yui',
				},
				underscore: {
					dependencies: [],
					path: 'underscore',
				},
				lodash: {
					dependencies: [],
					path: 'lodash',
				},
			},
		});

		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build([
			'jquery',
			'underscore',
			'yui',
			'lodash',
		]);

		assert.strictEqual(2, modulesURL.length);

		assert.strictEqual(
			'http://localhost:3000/modules?/base/underscore.js&/base/lodash.js',
			modulesURL[0].url
		);
		assert.sameMembers(['underscore', 'lodash'], modulesURL[0].modules);

		assert.strictEqual(
			'http://localhost:3000/modules?/jquery.js&/yui.js',
			modulesURL[1].url
		);
		assert.sameMembers(['jquery', 'yui'], modulesURL[1].modules);
	});

	it('should not combine anonymous modules', function() {
		var configParser = new global.ConfigParser({
			url: 'http://localhost:3000/modules?',
			combine: true,
			basePath: '/base',
			modules: {
				foo: {
					dependencies: [],
				},
				bar: {
					dependencies: [],
				},
				baz: {
					dependencies: [],
					anonymous: true,
				},
			},
		});

		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build(['foo', 'bar', 'baz']);

		assert.strictEqual(2, modulesURL.length);
		assert.strictEqual(
			'http://localhost:3000/modules?/base/baz.js',
			modulesURL[0].url
		);
		assert.strictEqual(
			'http://localhost:3000/modules?/base/foo.js&/base/bar.js',
			modulesURL[1].url
		);
	});

	it('should create combo URLs up to 2000 characters', function() {
		// Create a 640 character suffix
		var longModuleNameSuffix = new Array(65).join('1234567890');

		var configParser = new global.ConfigParser({
			url: 'http://localhost:3000/modules?',
			combine: true,
			basePath: '/base',
			urlMaxLength: 2000,
			modules: {
				module1: {
					dependencies: [],
					path: 'module1' + longModuleNameSuffix,
				},
				module2: {
					dependencies: [],
					path: 'module1' + longModuleNameSuffix,
				},
				module3: {
					dependencies: [],
					path: 'module1' + longModuleNameSuffix,
				},
				module4: {
					dependencies: [],
					path: 'module1' + longModuleNameSuffix,
				},
				module5: {
					dependencies: [],
					path: 'module1' + longModuleNameSuffix,
				},
				module6: {
					dependencies: [],
					path: 'module1' + longModuleNameSuffix,
				},
				absolute1: {
					dependencies: [],
					path: '/absolute/absolute1' + longModuleNameSuffix,
				},
				absolute2: {
					dependencies: [],
					path: '/absolute/absolute2' + longModuleNameSuffix,
				},
				absolute3: {
					dependencies: [],
					path: '/absolute/absolute3' + longModuleNameSuffix,
				},
				absolute4: {
					dependencies: [],
					path: '/absolute/absolute4' + longModuleNameSuffix,
				},
			},
		});

		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build([
			'module1',
			'absolute1',
			'module2',
			'absolute2',
			'module3',
			'absolute3',
			'module4',
			'absolute4',
			'module5',
			'module6',
		]);

		assert.strictEqual(5, modulesURL.length);

		modulesURL.forEach(function(moduleURL) {
			assert.isTrue(moduleURL.url.length < 2000);
		});
	});

	it('should add parameters to urls', function() {
		var configParser = new global.ConfigParser({
			url: 'http://localhost:3000/modules',
			combine: false,
			defaultURLParams: {
				languageId: 'en_US',
			},
			basePath: '/base',
			modules: {
				foo: {
					dependencies: [],
				},
				bar: {
					dependencies: [],
				},
				baz: {
					dependencies: [],
					anonymous: true,
				},
			},
		});

		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build(['foo']);

		assert.strictEqual(1, modulesURL.length);
		assert.strictEqual(
			'http://localhost:3000/modules/base/foo.js?languageId=en_US',
			modulesURL[0].url
		);
	});

	it('should add parameters to combined urls', function() {
		var configParser = new global.ConfigParser({
			url: 'http://localhost:3000/modules?',
			combine: true,
			defaultURLParams: {
				languageId: 'en_US',
			},
			basePath: '/base',
			modules: {
				foo: {
					dependencies: [],
				},
				bar: {
					dependencies: [],
				},
				baz: {
					dependencies: [],
					anonymous: true,
				},
			},
		});

		var urlBuilder = new global.URLBuilder(configParser);

		var modulesURL = urlBuilder.build(['foo', 'bar']);

		assert.strictEqual(1, modulesURL.length);
		assert.strictEqual(
			'http://localhost:3000/modules?/base/foo.js&/base/bar.js&languageId=en_US',
			modulesURL[0].url
		);
	});
});
