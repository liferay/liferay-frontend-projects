/**
 * © 2014 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Config from '../config';
import URLBuilder from '../url-builder';

describe('URLBuilder', () => {
	let config;
	let urlBuilder;

	beforeEach(() => {
		config = new Config({
			url: 'http://localhost:3000/combo?',
			basePath: '/modules',
			combine: true,
		});

		urlBuilder = new URLBuilder(config);
	});

	it('should create URL for module with path', () => {
		config.addModule('aui-core');

		const modulesURL = urlBuilder.build(['aui-core']);

		expect(modulesURL).toHaveLength(1);

		expect(modulesURL[0]).toMatchObject({
			url: 'http://localhost:3000/combo?/modules/aui-core.js',
			modules: ['aui-core'],
		});
	});

	it('should append a trailing .js extension if missing', () => {
		config.addModule('module');

		const modulesURL = urlBuilder.build(['module']);

		expect(modulesURL).toHaveLength(1);
		expect(modulesURL[0]).toMatchObject({
			url: 'http://localhost:3000/combo?/modules/module.js',
			modules: ['module'],
		});
	});

	it('should not append the trailing .js extension if present', () => {
		config.addModule('module.js');

		const modulesURL = urlBuilder.build(['module.js']);

		expect(modulesURL).toHaveLength(1);
		expect(modulesURL[0]).toMatchObject({
			url: 'http://localhost:3000/combo?/modules/module.js',
			modules: ['module.js'],
		});
	});

	it('should create one url per module when combine set to false', () => {
		config._config.url = 'http://localhost:3000';
		config._config.combine = false;

		config.addModule('aui-base');
		config.addModule('aui-core.js');

		const modulesURL = urlBuilder.build(['aui-base', 'aui-core.js']);

		expect(modulesURL).toHaveLength(2);

		expect(modulesURL[0]).toMatchObject({
			url: 'http://localhost:3000/modules/aui-base.js',
			modules: ['aui-base'],
		});
		expect(modulesURL[1]).toMatchObject({
			url: 'http://localhost:3000/modules/aui-core.js',
			modules: ['aui-core.js'],
		});
	});

	it('should not replace parts of path', () => {
		config._config.url = 'http://localhost:3000';
		config._config.combine = false;

		config.addModule('jquery');
		config.addModule('aui');
		config.addModule('aui/js/loader.js');
		config.addModule('test/aui/js/aui/loader.js');
		config.addPaths({
			aui: 'html/js',
		});

		const modulesURL = urlBuilder.build([
			'jquery',
			'aui',
			'aui/js/loader.js',
			'test/aui/js/aui/loader.js',
		]);

		expect(modulesURL).toHaveLength(4);

		expect(modulesURL[0]).toMatchObject({
			url: 'http://localhost:3000/modules/jquery.js',
			modules: ['jquery'],
		});

		expect(modulesURL[1]).toMatchObject({
			url: 'http://localhost:3000/modules/html/js.js',
			modules: ['aui'],
		});

		expect(modulesURL[2]).toMatchObject({
			url: 'http://localhost:3000/modules/html/js/js/loader.js',
			modules: ['aui/js/loader.js'],
		});

		expect(modulesURL[3]).toMatchObject({
			url: 'http://localhost:3000/modules/test/aui/js/aui/loader.js',
			modules: ['test/aui/js/aui/loader.js'],
		});
	});

	it('should not add trailing slash if base is an empty string', () => {
		config._config.url = 'http://localhost:3000?';
		config._config.basePath = '';
		config._config.combine = false;

		config.addModule('aui-base');
		config.addModule('aui-core.js');

		const modulesURL = urlBuilder.build(['aui-base', 'aui-core.js']);

		expect(modulesURL).toHaveLength(2);

		expect(modulesURL[0]).toMatchObject({
			url: 'http://localhost:3000?aui-base.js',
			modules: ['aui-base'],
		});
		expect(modulesURL[1]).toMatchObject({
			url: 'http://localhost:3000?aui-core.js',
			modules: ['aui-core.js'],
		});
	});

	it(
		'should not add trailing slash if base is an empty string and ' +
			'combine is true',
		() => {
			config._config.url = 'http://localhost:3000?';
			config._config.basePath = '';
			config._config.combine = true;

			config.addModule('aui-base');
			config.addModule('aui-core.js');

			const modulesURL = urlBuilder.build(['aui-base', 'aui-core.js']);

			expect(modulesURL).toHaveLength(1);

			expect(modulesURL[0]).toMatchObject({
				url: 'http://localhost:3000?aui-base.js&aui-core.js',
				modules: ['aui-base', 'aui-core.js'],
			});
		}
	);

	it('should combine modules with and without absolute url', () => {
		config.addModule('jquery');
		config.addModule('underscore');
		config.addModule('yui');
		config.addModule('lodash');

		const modulesURL = urlBuilder.build([
			'jquery',
			'underscore',
			'yui',
			'lodash',
		]);

		expect(modulesURL).toHaveLength(1);
		expect(modulesURL[0]).toMatchObject({
			url:
				'http://localhost:3000/combo?/modules/jquery.js&/modules/underscore.js&/modules/yui.js&/modules/lodash.js',
			modules: ['jquery', 'underscore', 'yui', 'lodash'],
		});
	});

	it('should create combo URLs up to config.urlMaxLength characters', () => {
		config._config.urlMaxLength = 90;

		config.addModule('module_1_0123456789ABCDEF');
		config.addModule('module_2_0123456789ABCDEF');
		config.addModule('module3');
		config.addModule('module4');

		const modulesURL = urlBuilder.build([
			'module_1_0123456789ABCDEF',
			'module_2_0123456789ABCDEF',
			'module3',
			'module4',
		]);

		expect(modulesURL).toHaveLength(3);

		const urlLengths = modulesURL.map(moduleURL => moduleURL.url.length);

		expect(urlLengths).toEqual([65, 85, 47]);
	});

	it('should add parameters to urls', () => {
		config._config.url = 'http://localhost:3000';
		config._config.combine = false;
		config._config.defaultURLParams = {
			languageId: 'en_US',
		};

		config.addModule('foo');

		const modulesURL = urlBuilder.build(['foo']);

		expect(modulesURL).toHaveLength(1);
		expect(modulesURL[0].url).toBe(
			'http://localhost:3000/modules/foo.js?languageId=en_US'
		);
	});

	it('should add parameters to combined urls', () => {
		config._config.defaultURLParams = {
			languageId: 'en_US',
		};

		config.addModule('foo');
		config.addModule('bar');

		const modulesURL = urlBuilder.build(['foo', 'bar']);

		expect(modulesURL).toHaveLength(1);
		expect(modulesURL[0].url).toBe(
			'http://localhost:3000/combo?/modules/foo.js&/modules/bar.js&languageId=en_US'
		);
	});
});
