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

describe('global config', () => {
	describe('isCreateJar()', () => {
		it('returns false when config missing', () => {
			expect(cfg.isCreateJar()).toBeFalsy();
		});

		it('works with boolean config', () => {
			process.chdir(
				path.join(
					__dirname,
					'__fixtures__',
					'config',
					'create-jar-bool'
				)
			);
			cfg.reloadConfig();

			expect(cfg.isCreateJar()).toBeTruthy();
		});

		it('works with Object config', () => {
			process.chdir(
				path.join(__dirname, '__fixtures__', 'config', 'create-jar')
			);
			cfg.reloadConfig();

			expect(cfg.isCreateJar()).toBeTruthy();
		});
	});

	it('getOutputDir() works', () => {
		expect(cfg.getOutputDir()).toEqual('output-dir');
	});

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
	describe('getOutputDir()', () => {
		it('works when specified in .npmbundlerrc', () => {
			process.chdir(
				path.join(__dirname, '__fixtures__', 'config', 'create-jar')
			);
			cfg.reloadConfig();

			expect(cfg.jar.getOutputDir()).toEqual('dist');
		});

		it('works when not set', () => {
			expect(cfg.jar.getOutputDir()).toEqual(cfg.getOutputDir());
		});
	});

	describe('getWebContextPath()', () => {
		it('works when specified in .npmbundlerrc', () => {
			process.chdir(
				path.join(__dirname, '__fixtures__', 'config', 'create-jar')
			);
			cfg.reloadConfig();

			expect(cfg.jar.getWebContextPath()).toEqual('/my-portlet');
		});

		it('works when specified in package.json', () => {
			process.chdir(
				path.join(
					__dirname,
					'__fixtures__',
					'config',
					'create-jar-empty'
				)
			);
			cfg.reloadConfig();

			expect(cfg.jar.getWebContextPath()).toEqual('/other-portlet');
		});

		it('works when not set', () => {
			expect(cfg.jar.getWebContextPath()).toEqual('/default-1.0.0');
		});
	});

	describe('isAutoDeployPortlet()', () => {
		it('returns false when create-jar config missing', () => {
			expect(cfg.jar.isAutoDeployPortlet()).toBe(false);
		});

		it('returns true when create-jar config present and auto-deploy-portlet missing', () => {
			process.chdir(
				path.join(
					__dirname,
					'__fixtures__',
					'config',
					'create-jar-empty'
				)
			);
			cfg.reloadConfig();

			expect(cfg.jar.isAutoDeployPortlet()).toBe(true);
		});

		it('returns false when create-jar config present and auto-deploy-portlet false', () => {
			expect(cfg.jar.isAutoDeployPortlet()).toBe(false);
		});
	});
});
