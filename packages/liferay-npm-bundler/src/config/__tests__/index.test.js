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
	it('works with existing presets', () => {
		process.chdir(
			path.join(__dirname, '__fixtures__', 'config', 'presets')
		);
		cfg.reloadConfig();

		expect(cfg.isDumpReport()).toBeTruthy();
	});
});
