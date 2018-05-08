const projectDir = process.cwd();
const cfg = require('../config');

beforeEach(() => {
	process.chdir(
		`${projectDir}/packages/liferay-npm-bundler/src/__tests__/config/` +
			'default'
	);
	cfg.reloadConfig();
});

afterEach(() => {
	process.chdir(projectDir);
});

describe('getOutputDir()', () => {
	it('works', () => {
		expect(cfg.getOutputDir()).toEqual('output-dir');
	});
});

describe('getExclusions()', () => {
	it('works for unversioned packages', () => {
		const pkg = {
			id: 'package-a@2.0.0',
			name: 'package-a',
			version: '2.0.0',
			dir: '',
		};

		expect(cfg.getExclusions(pkg)).toEqual(['*']);
	});

	it('works for versioned packages', () => {
		const pkg = {
			id: 'package-b@1.0.0',
			name: 'package-b',
			version: '1.0.0',
			dir: '',
		};

		expect(cfg.getExclusions(pkg)).toEqual(['**/*.js', '**/*.css']);
	});

	it('returns the default exclusions for unconfigured packages', () => {
		const pkg = {
			id: 'not-existent-package@1.0.0',
			name: 'not-existent-package',
			version: '1.0.0',
			dir: '',
		};

		expect(cfg.getExclusions(pkg)).toEqual(['test/**/*']);
	});

	// Impossible to test once we test for default exclusions
	it('returns an empty array for unconfigured packages', () => {
		process.chdir(
			`${projectDir}/packages/liferay-npm-bundler/src/__tests__/config/` +
				'empty'
		);
		cfg.reloadConfig();

		const pkg = {
			id: 'not-existent-package@1.0.0',
			name: 'not-existent-package',
			version: '1.0.0',
			dir: '',
		};

		expect(cfg.getExclusions(pkg)).toEqual([]);
	});
});

describe('getPlugins()', () => {
	it('loads default "pre" plugins correctly', () => {
		const plugins = cfg.getPlugins('pre', {
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
		const plugins = cfg.getPlugins('post', {
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
		const plugins = cfg.getPlugins('pre', {
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
		const plugins = cfg.getPlugins('post', {
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
			`${projectDir}/packages/liferay-npm-bundler/src/__tests__/config/` +
				'legacy-packages'
		);
		cfg.reloadConfig();

		let plugins = cfg.getPlugins('pre', {
			id: 'package@1.0.0',
			name: 'package',
			version: '1.0.0',
			dir: '',
		});
		expect(plugins[0].run({}, {})).toEqual(1);

		plugins = cfg.getPlugins('pre', {
			id: 'package2@1.0.0',
			name: 'package2',
			version: '1.0.0',
			dir: '',
		});
		expect(plugins[0].run({}, {})).toEqual(2);

		plugins = cfg.getPlugins('pre', {
			id: 'package3@1.0.0',
			name: 'package3',
			version: '1.0.0',
			dir: '',
		});
		expect(plugins[0].run({}, {})).toEqual(4);

		plugins = cfg.getPlugins('pre', {
			id: 'unconfigured-package@1.0.0',
			name: 'unconfigured-package',
			version: '1.0.0',
			dir: '',
		});
		expect(plugins[0].run({}, {})).toEqual(0);
	});
});

describe('getBabelConfig()', () => {
	it('loads default config correctly', () => {
		const config = cfg.getBabelConfig({
			id: 'package-star@1.0.0',
			name: 'package-star',
			version: '1.0.0',
			dir: '',
		});

		expect(config).toEqual({config: 'config-*'});
	});

	it('loads per-package config correctly when configured by id', () => {
		const config = cfg.getBabelConfig({
			id: 'package@1.0.0',
			name: 'package',
			version: '1.0.0',
			dir: '',
		});

		expect(config).toEqual({config: 'config-package@1.0.0'});
	});

	it('loads per-package config correctly when configured by name', () => {
		const config = cfg.getBabelConfig({
			id: 'package2@1.0.0',
			name: 'package2',
			version: '1.0.0',
			dir: '',
		});

		expect(config).toEqual({config: 'config-package2'});
	});
});

describe('getPluginVersions()', () => {
	it('analyzes default config correctly', () => {
		const versions = cfg.getVersionsInfo();
		const myVersion = require('../../package.json').version;

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
