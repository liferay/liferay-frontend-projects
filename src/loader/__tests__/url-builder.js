import config from './fixture/config.js';
import ConfigParser from '../config-parser';
import URLBuilder from '../url-builder';

const configParser = new ConfigParser(config);

describe('URLBuilder', function() {
	it('should create URL for module with path', function() {
		let urlBuilder = new URLBuilder(configParser);

		let modulesURL = urlBuilder.build(['aui-core']);

		expect(modulesURL).toHaveLength(1);

		expect(modulesURL[0].url).toBe(
			'http://localhost:3000/combo?/modules/aui-core.js'
		);
		expect(modulesURL[0].modules).toEqual(['aui-core']);
	});

	it(
		'should append a trailing .js extension if the module path does not ' +
			'have one',
		function() {
			let urlBuilder = new URLBuilder(configParser);

			let modulesURL = urlBuilder.build(['module']);

			expect(modulesURL).toHaveLength(1);
			expect(modulesURL[0].url).toBe(
				'http://localhost:3000/combo?/modules/module/src/module.js'
			);
			expect(modulesURL[0].modules).toEqual(['module']);
		}
	);

	it(
		'should not append the trailing .js extension if the module path ' +
			'already ends in .js',
		function() {
			let urlBuilder = new URLBuilder(configParser);

			let modulesURL = urlBuilder.build(['module.js']);

			expect(modulesURL).toHaveLength(1);
			expect(modulesURL[0].url).toBe(
				'http://localhost:3000/combo?/modules/module.js/src/module.js'
			);

			expect(modulesURL[0].modules).toEqual(['module.js']);
		}
	);

	it('should create URL for module with full path', function() {
		let urlBuilder = new URLBuilder(configParser);

		let modulesURL = urlBuilder.build(['aui-base']);

		expect(modulesURL).toHaveLength(1);

		expect(modulesURL[0].url).toBe(
			'http://localhost:8080/demo/modules/aui-base.js'
		);
		expect(modulesURL[0].modules).toEqual(['aui-base']);
	});

	it('should create url for module when combine set to false', function() {
		let configParser = new ConfigParser({
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

		let urlBuilder = new URLBuilder(configParser);

		let modulesURL = urlBuilder.build(['aui-base', 'aui-core.js']);

		expect(modulesURL).toHaveLength(2);

		expect(modulesURL[0].url).toBe(
			'http://localhost:3000/modules/base/aui-base.js'
		);
		expect(modulesURL[0].modules).toEqual(['aui-base']);

		expect(modulesURL[1].url).toBe(
			'http://localhost:3000/modules/base/aui-core.js'
		);
		expect(modulesURL[1].modules).toEqual(['aui-core.js']);
	});

	it('should map module\'s path via function', function() {
		let configParser = new ConfigParser({
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

		let urlBuilder = new URLBuilder(configParser);

		let modulesURL = urlBuilder.build(['a', 'b']);

		expect(modulesURL).toHaveLength(2);

		expect(modulesURL[0].url).toBe('https://a.com/a.js');
		expect(modulesURL[0].modules).toEqual(['a']);

		expect(modulesURL[1].url).toBe('https://a.com/b.js');
		expect(modulesURL[1].modules).toEqual(['b']);
	});

	it('should create url for modules with external URLs', function() {
		let configParser = new ConfigParser({
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

		let urlBuilder = new URLBuilder(configParser);

		let modulesURL = urlBuilder.build([
			'https://code.jquery.com/ui/1.11.2/jquery-ui.min.js',
			'jquery-2.1.2',
			'//code.jquery.com/jquery-1.11.2.min.js',
			'www.mydomain.com/crap.js',
		]);

		expect(modulesURL).toHaveLength(4);

		expect(modulesURL[0].url).toBe(
			'https://code.jquery.com/ui/1.11.2/jquery-ui.min.js'
		);
		expect(modulesURL[0].modules).toEqual([
			'https://code.jquery.com/ui/1.11.2/jquery-ui.min.js',
		]);

		expect(modulesURL[1].url).toBe(
			'http://code.jquery.com/jquery-2.1.2.min.js'
		);
		expect(modulesURL[1].modules).toEqual(['jquery-2.1.2']);

		expect(modulesURL[2].url).toBe(
			'//code.jquery.com/jquery-1.11.2.min.js'
		);
		expect(modulesURL[2].modules).toEqual([
			'//code.jquery.com/jquery-1.11.2.min.js',
		]);

		expect(modulesURL[3].url).toBe('www.mydomain.com/crap.js');
		expect(modulesURL[3].modules).toEqual(['www.mydomain.com/crap.js']);
	});

	it('should not replace parts of path', function() {
		let configParser = new ConfigParser({
			url: 'http://localhost:3000/modules',
			basePath: '/base',
			paths: {
				jquery: 'http://code.jquery.com/jquery-2.1.3.min.js',
				aui: 'html/js',
			},
			modules: {
				'jquery': {
					dependencies: [],
				},
				'aui': {
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

		let urlBuilder = new URLBuilder(configParser);

		let modulesURL = urlBuilder.build([
			'jquery',
			'aui',
			'aui/js/loader.js',
			'test/aui/js/aui/loader.js',
		]);

		expect(modulesURL).toHaveLength(4);

		expect(modulesURL[0].url).toBe(
			'http://code.jquery.com/jquery-2.1.3.min.js'
		);
		expect(modulesURL[0].modules).toEqual(['jquery']);

		expect(modulesURL[1].url).toBe(
			'http://localhost:3000/modules/base/html/js.js'
		);
		expect(modulesURL[1].modules).toEqual(['aui']);

		expect(modulesURL[2].url).toBe(
			'http://localhost:3000/modules/base/html/js/js/loader.js'
		);
		expect(modulesURL[2].modules).toEqual(['aui/js/loader.js']);

		expect(modulesURL[3].url).toBe(
			'http://localhost:3000/modules/base/test/aui/js/aui/loader.js'
		);
		expect(modulesURL[3].modules).toEqual(['test/aui/js/aui/loader.js']);
	});

	it('should not add basePath when module has absolute url', function() {
		let configParser = new ConfigParser({
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

		let urlBuilder = new URLBuilder(configParser);

		let modulesURL = urlBuilder.build(['jquery', 'underscore']);

		expect(modulesURL).toHaveLength(1);
		expect(modulesURL[0].url).toBe(
			'http://localhost:3000/modules?/jquery.js&/underscore.js'
		);
		expect(modulesURL[0].modules).toEqual(['jquery', 'underscore']);
	});

	it('should not add trailing slash if base is an empty string', function() {
		let configParser = new ConfigParser({
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

		let urlBuilder = new URLBuilder(configParser);

		let modulesURL = urlBuilder.build(['aui-base', 'aui-core.js']);

		expect(modulesURL).toHaveLength(2);

		expect(modulesURL[0].url).toBe(
			'http://localhost:3000/modules?aui-base.js'
		);
		expect(modulesURL[0].modules).toEqual(['aui-base']);

		expect(modulesURL[1].url).toBe(
			'http://localhost:3000/modules?aui-core.js'
		);
		expect(modulesURL[1].modules).toEqual(['aui-core.js']);
	});

	it(
		'should not add trailing slash if base is an empty string and ' +
			'combine is true',
		function() {
			let configParser = new ConfigParser({
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

			let urlBuilder = new URLBuilder(configParser);

			let modulesURL = urlBuilder.build(['aui-base', 'aui-core.js']);

			expect(modulesURL).toHaveLength(1);

			expect(modulesURL[0].url).toBe(
				'http://localhost:3000/modules?aui-base.js&aui-core.js'
			);
			expect(modulesURL[0].modules).toEqual(['aui-base', 'aui-core.js']);
		}
	);

	it('should combine modules with and without absolute url', function() {
		let configParser = new ConfigParser({
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

		let urlBuilder = new URLBuilder(configParser);

		let modulesURL = urlBuilder.build([
			'jquery',
			'underscore',
			'yui',
			'lodash',
		]);

		expect(modulesURL).toHaveLength(2);

		expect(modulesURL[0].url).toBe(
			'http://localhost:3000/modules?/base/underscore.js&/base/lodash.js'
		);
		expect(modulesURL[0].modules).toEqual(['underscore', 'lodash']);

		expect(modulesURL[1].url).toBe(
			'http://localhost:3000/modules?/jquery.js&/yui.js'
		);
		expect(modulesURL[1].modules).toEqual(['jquery', 'yui']);
	});

	it('should not combine anonymous modules', function() {
		let configParser = new ConfigParser({
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

		let urlBuilder = new URLBuilder(configParser);

		let modulesURL = urlBuilder.build(['foo', 'bar', 'baz']);

		expect(modulesURL).toHaveLength(2);
		expect(modulesURL[0].url).toBe(
			'http://localhost:3000/modules?/base/baz.js'
		);
		expect(modulesURL[1].url).toBe(
			'http://localhost:3000/modules?/base/foo.js&/base/bar.js'
		);
	});

	it('should create combo URLs up to 2000 characters', function() {
		// Create a 640 character suffix
		let longModuleNameSuffix = new Array(65).join('1234567890');

		let configParser = new ConfigParser({
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

		let urlBuilder = new URLBuilder(configParser);

		let modulesURL = urlBuilder.build([
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

		expect(modulesURL).toHaveLength(5);

		let urlLengths = modulesURL.map(moduleURL => moduleURL.url.length);

		urlLengths.forEach(length => expect(length).toBeLessThan(2000));
	});

	it('should add parameters to urls', function() {
		let configParser = new ConfigParser({
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

		let urlBuilder = new URLBuilder(configParser);

		let modulesURL = urlBuilder.build(['foo']);

		expect(modulesURL).toHaveLength(1);
		expect(modulesURL[0].url).toBe(
			'http://localhost:3000/modules/base/foo.js?languageId=en_US'
		);
	});

	it('should add parameters to combined urls', function() {
		let configParser = new ConfigParser({
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

		let urlBuilder = new URLBuilder(configParser);

		let modulesURL = urlBuilder.build(['foo', 'bar']);

		expect(modulesURL).toHaveLength(1);
		expect(modulesURL[0].url).toBe(
			'http://localhost:3000/modules?/base/foo.js&/base/bar.js&languageId=en_US'
		);
	});
});
