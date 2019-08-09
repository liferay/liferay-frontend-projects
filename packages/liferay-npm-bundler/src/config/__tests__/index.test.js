/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import path from 'path';

const cfg = require('..');

const savedCwd = process.cwd();

beforeEach(() => {
	process.chdir(path.join(__dirname, '__fixtures__', 'config', 'default'));
	cfg.reloadConfig();
});

afterEach(() => {
	process.chdir(savedCwd);
});

describe('deprecated config', () => {
	describe('.npmbundlerrc', () => {
		it('create-jar/auto-deploy-portlet', () => {
			process.chdir(
				path.join(__dirname, '__fixtures__', 'config', 'legacy-test-1')
			);
			cfg.reloadConfig();

			expect(cfg.jar.getRequireJsExtender()).toBe(false);
		});
	});
});

describe('global config', () => {
	it('getVersionsInfo() works', () => {
		const versions = cfg.getVersionsInfo();
		const myVersion = require('../../../package.json').version;

		expect(Object.keys(versions).length).toEqual(9);
		expect(versions['liferay-npm-bundler']).toEqual(myVersion);
		expect(versions['liferay-npm-bundler-plugin-test-0']).toEqual('1.0.0');
		expect(versions['liferay-npm-bundler-plugin-test-1']).toEqual('1.0.1');
		expect(versions['liferay-npm-bundler-plugin-test-2']).toEqual('1.0.2');
		expect(versions['liferay-npm-bundler-plugin-test-3']).toEqual('1.0.3');
		expect(versions['liferay-npm-bundler-plugin-test-4']).toEqual('1.0.4');
		expect(versions['liferay-npm-bundler-plugin-test-5']).toEqual('1.0.5');
		expect(versions['liferay-npm-bundler-plugin-test-6']).toEqual('1.0.6');
		expect(versions['liferay-npm-bundler-plugin-test-7']).toEqual('1.0.7');
	});
});

describe('babel config', () => {
	describe('getConfig()', () => {
		it('loads default config correctly', () => {
			const config = cfg.babel.getConfig({
				id: 'package-star@1.0.0',
				name: 'package-star',
				version: '1.0.0',
				dir: '',
			});

			expect(config).toEqual({config: 'config-*'});
		});

		it('loads per-package config correctly when configured by id', () => {
			const config = cfg.babel.getConfig({
				id: 'package@1.0.0',
				name: 'package',
				version: '1.0.0',
				dir: '',
			});

			expect(config).toEqual({config: 'config-package@1.0.0'});
		});

		it('loads per-package config correctly when configured by name', () => {
			const config = cfg.babel.getConfig({
				id: 'package2@1.0.0',
				name: 'package2',
				version: '1.0.0',
				dir: '',
			});

			expect(config).toEqual({config: 'config-package2'});
		});
	});
});

describe('bundler config', () => {
	describe('getExclusions()', () => {
		it('works for unversioned packages', () => {
			const pkg = {
				id: 'package-a@2.0.0',
				name: 'package-a',
				version: '2.0.0',
				dir: '',
			};

			expect(cfg.bundler.getExclusions(pkg)).toEqual(['*']);
		});

		it('works for versioned packages', () => {
			const pkg = {
				id: 'package-b@1.0.0',
				name: 'package-b',
				version: '1.0.0',
				dir: '',
			};

			expect(cfg.bundler.getExclusions(pkg)).toEqual([
				'**/*.js',
				'**/*.css',
			]);
		});

		it('returns the default exclusions for unconfigured packages', () => {
			const pkg = {
				id: 'not-existent-package@1.0.0',
				name: 'not-existent-package',
				version: '1.0.0',
				dir: '',
			};

			expect(cfg.bundler.getExclusions(pkg)).toEqual(['test/**/*']);
		});

		// Impossible to test once we test for default exclusions
		it('returns an empty array for unconfigured packages', () => {
			process.chdir(
				path.join(__dirname, '__fixtures__', 'config', 'empty')
			);
			cfg.reloadConfig();

			const pkg = {
				id: 'not-existent-package@1.0.0',
				name: 'not-existent-package',
				version: '1.0.0',
				dir: '',
			};

			expect(cfg.bundler.getExclusions(pkg)).toEqual([]);
		});
	});

	describe('getPlugins()', () => {
		it('loads default "pre" plugins correctly', () => {
			const plugins = cfg.bundler.getPlugins('pre', {
				id: 'package-star@1.0.0',
				name: 'package-star',
				version: '1.0.0',
				dir: '',
			});

			expect(plugins[0].run({}, {})).toEqual(0);
			expect(plugins[0].config).toEqual({});

			expect(plugins[1].run({}, {})).toEqual(1);
			expect(plugins[1].config).toEqual('config-1');
		});

		it('loads default "post" plugins correctly', () => {
			const plugins = cfg.bundler.getPlugins('post', {
				id: 'package-star@1.0.0',
				name: 'package-star',
				version: '1.0.0',
				dir: '',
			});

			expect(plugins[0].run({}, {})).toEqual(2);
			expect(plugins[0].config).toEqual({});

			expect(plugins[1].run({}, {})).toEqual(3);
			expect(plugins[1].config).toEqual('config-3');
		});

		it('loads per-package "pre" plugins correctly', () => {
			const plugins = cfg.bundler.getPlugins('pre', {
				id: 'package@1.0.0',
				name: 'package',
				version: '1.0.0',
				dir: '',
			});

			expect(plugins[0].run({}, {})).toEqual(4);
			expect(plugins[0].config).toEqual({});

			expect(plugins[1].run({}, {})).toEqual(5);
			expect(plugins[1].config).toEqual('config-5');
		});

		it('loads per-package "post" plugins correctly', () => {
			const plugins = cfg.bundler.getPlugins('post', {
				id: 'package@1.0.0',
				name: 'package',
				version: '1.0.0',
				dir: '',
			});

			expect(plugins[0].run({}, {})).toEqual(6);
			expect(plugins[0].config).toEqual({});

			expect(plugins[1].run({}, {})).toEqual(7);
			expect(plugins[1].config).toEqual('config-7');
		});

		it('supports legacy package configurations correctly', () => {
			process.chdir(
				path.join(
					__dirname,
					'__fixtures__',
					'config',
					'legacy-packages'
				)
			);
			cfg.reloadConfig();

			let plugins = cfg.bundler.getPlugins('pre', {
				id: 'package@1.0.0',
				name: 'package',
				version: '1.0.0',
				dir: '',
			});
			expect(plugins[0].run({}, {})).toEqual(1);

			plugins = cfg.bundler.getPlugins('pre', {
				id: 'package2@1.0.0',
				name: 'package2',
				version: '1.0.0',
				dir: '',
			});
			expect(plugins[0].run({}, {})).toEqual(2);

			plugins = cfg.bundler.getPlugins('pre', {
				id: 'package3@1.0.0',
				name: 'package3',
				version: '1.0.0',
				dir: '',
			});
			expect(plugins[0].run({}, {})).toEqual(4);

			plugins = cfg.bundler.getPlugins('pre', {
				id: 'unconfigured-package@1.0.0',
				name: 'unconfigured-package',
				version: '1.0.0',
				dir: '',
			});
			expect(plugins[0].run({}, {})).toEqual(0);
		});
	});
});

describe('jar config', () => {
	describe('getRequireJsExtender()', () => {
		it('returns true when create-jar config present and features/js-extender missing', () => {
			process.chdir(
				path.join(
					__dirname,
					'__fixtures__',
					'config',
					'create-jar-empty'
				)
			);
			cfg.reloadConfig();

			expect(cfg.jar.getRequireJsExtender()).toBe(true);
		});

		it('returns false when create-jar config present and features/js-extender false', () => {
			process.chdir(
				path.join(__dirname, '__fixtures__', 'config', 'create-jar')
			);
			cfg.reloadConfig();

			expect(cfg.jar.getRequireJsExtender()).toBe(false);
		});
	});
});

describe('presets', () => {
	it('should work with existing presets', () => {
		process.chdir(
			path.join(__dirname, '__fixtures__', 'config', 'presets')
		);
		cfg.reloadConfig();

		const globalCfg = cfg.getGlobalConfig();

		expect(globalCfg.imports).toBeDefined();

		const expectedImports = [
			'an-osgi-module',
			'frontend-js-metal-web',
			'frontend-js-node-shims',
			'frontend-js-spa-web',
			'frontend-taglib',
			'frontend-taglib-clay',
		];

		expectedImports.map(v => {
			expect(globalCfg.imports[v]).toBeDefined();
		});

		const anOsgiModuleImports = {
			d3: '>=3.0.0',
			react: '>=16.8.5',
		};

		expect(globalCfg.imports['an-osgi-module']).toMatchObject(
			anOsgiModuleImports
		);

		const frontendJsWebImports = {
			'/': '>=8.0.0',
		};

		expect(globalCfg.imports['frontend-js-web']).toMatchObject(
			frontendJsWebImports
		);

		const frontendJsNodeShimsImports = {
			assert: '>=1.2.0',
			buffer: '>=5.0.7',
			'console-browserify': '>=1.1.0',
			'domain-browser': '>=1.1.7',
			events: '>=1.1.1',
			'os-browserify': '>=0.3.0',
			'path-browserify': '>=0.0.0',
			process: '>=0.11.10',
			punycode: '>=1.3.1',
			'querystring-es3': '>=0.2.1',
			setimmediate: '>=1.0.0',
			string_decoder: '>=1.0.3',
			'timers-browserify': '>=2.0.4',
			'tty-browserify': '>=0.0.0',
			url: '>=0.11.0',
			util: '>=0.10.3',
			'vm-browserify': '>=0.0.4',
		};

		expect(globalCfg.imports['frontend-js-node-shims']).toMatchObject(
			frontendJsNodeShimsImports
		);

		expect(cfg.isDumpReport()).toBeTruthy();
	});
});
