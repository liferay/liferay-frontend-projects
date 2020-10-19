/**
 * SPDX-FileCopyrightText: © 2014 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import Config from '../../src/loader/config';
import URLBuilder from '../../src/loader/url-builder';

describe('URLBuilder', () => {
	let config;
	let urlBuilder;

	beforeEach(() => {
		config = new Config({
			basePath: '/modules',
			combine: true,
			url: 'http://localhost:3000/combo?',
		});

		urlBuilder = new URLBuilder(config);
	});

	it('creates URL for module with path', () => {
		config.addModule('aui-core');

		const modulesURL = urlBuilder.build(['aui-core']);

		expect(modulesURL).toHaveLength(1);

		expect(modulesURL[0]).toMatchObject({
			modules: ['aui-core'],
			url: 'http://localhost:3000/combo?/modules/aui-core.js',
		});
	});

	it('appends a trailing .js extension if missing', () => {
		config.addModule('module');

		const modulesURL = urlBuilder.build(['module']);

		expect(modulesURL).toHaveLength(1);
		expect(modulesURL[0]).toMatchObject({
			modules: ['module'],
			url: 'http://localhost:3000/combo?/modules/module.js',
		});
	});

	it('does not append the trailing .js extension if present', () => {
		config.addModule('module.js');

		const modulesURL = urlBuilder.build(['module.js']);

		expect(modulesURL).toHaveLength(1);
		expect(modulesURL[0]).toMatchObject({
			modules: ['module.js'],
			url: 'http://localhost:3000/combo?/modules/module.js',
		});
	});

	it('creates one url per module when combine set to false', () => {
		config._config.url = 'http://localhost:3000';
		config._config.combine = false;

		config.addModule('aui-base');
		config.addModule('aui-core.js');

		const modulesURL = urlBuilder.build(['aui-base', 'aui-core.js']);

		expect(modulesURL).toHaveLength(2);

		expect(modulesURL[0]).toMatchObject({
			modules: ['aui-base'],
			url: 'http://localhost:3000/modules/aui-base.js',
		});
		expect(modulesURL[1]).toMatchObject({
			modules: ['aui-core.js'],
			url: 'http://localhost:3000/modules/aui-core.js',
		});
	});

	it('does not replace parts of path', () => {
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
			modules: ['jquery'],
			url: 'http://localhost:3000/modules/jquery.js',
		});

		expect(modulesURL[1]).toMatchObject({
			modules: ['aui'],
			url: 'http://localhost:3000/modules/html/js.js',
		});

		expect(modulesURL[2]).toMatchObject({
			modules: ['aui/js/loader.js'],
			url: 'http://localhost:3000/modules/html/js/js/loader.js',
		});

		expect(modulesURL[3]).toMatchObject({
			modules: ['test/aui/js/aui/loader.js'],
			url: 'http://localhost:3000/modules/test/aui/js/aui/loader.js',
		});
	});

	it('does not add trailing slash if base is an empty string', () => {
		config._config.url = 'http://localhost:3000?';
		config._config.basePath = '';
		config._config.combine = false;

		config.addModule('aui-base');
		config.addModule('aui-core.js');

		const modulesURL = urlBuilder.build(['aui-base', 'aui-core.js']);

		expect(modulesURL).toHaveLength(2);

		expect(modulesURL[0]).toMatchObject({
			modules: ['aui-base'],
			url: 'http://localhost:3000?aui-base.js',
		});
		expect(modulesURL[1]).toMatchObject({
			modules: ['aui-core.js'],
			url: 'http://localhost:3000?aui-core.js',
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
				modules: ['aui-base', 'aui-core.js'],
				url: 'http://localhost:3000?aui-base.js&aui-core.js',
			});
		}
	);

	it('combines modules with and without absolute url', () => {
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
			modules: ['jquery', 'underscore', 'yui', 'lodash'],
			url:
				'http://localhost:3000/combo?/modules/jquery.js&/modules/underscore.js&/modules/yui.js&/modules/lodash.js',
		});
	});

	it('creates combo URLs up to config.urlMaxLength characters', () => {
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

		const urlLengths = modulesURL.map((moduleURL) => moduleURL.url.length);

		expect(urlLengths).toEqual([65, 85, 47]);
	});

	it('adds parameters to urls', () => {
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

	it('adds parameters to combined urls', () => {
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
