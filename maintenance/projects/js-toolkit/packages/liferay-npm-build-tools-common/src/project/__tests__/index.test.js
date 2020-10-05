/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import child_process from 'child_process';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import path from 'path';

import PkgDesc from '../../pkg-desc';
import {Project} from '../index';

////////////////////////////////////////////////////////////////////////////////
// Tests by property
////////////////////////////////////////////////////////////////////////////////

describe('project', () => {
	let project;

	beforeAll(() => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'standard')
		);
	});

	it('returns dir', () => {
		expect(project.dir.toString()).toBe(
			path.join(__dirname, '__fixtures__', 'project', 'standard')
		);
	});

	it('returns buildDir', () => {
		expect(project.buildDir.asPosix).toBe('./build');
	});

	it('returns globalConfig', () => {
		const {globalConfig} = project;

		expect(globalConfig.imports).toBeDefined();

		const expectedImports = [
			'an-osgi-module',
			'frontend-js-web',
			'frontend-js-node-shims',
		];

		expectedImports.map(v => {
			expect(globalConfig.imports[v]).toBeDefined();
		});

		expect(globalConfig.imports['an-osgi-module']).toMatchObject({
			d3: '>=3.0.0',
			react: '>=16.8.5',
		});

		expect(globalConfig.imports['frontend-js-web']).toMatchObject({
			'/': '>=8.0.0',
		});

		expect(globalConfig.imports['frontend-js-node-shims']).toMatchObject({
			assert: '>=1.2.0',
			punycode: '>=1.3.1',
			setimmediate: '>=1.0.0',
		});
	});
});

describe('project.copy', () => {
	let project;

	beforeAll(() => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'standard')
		);
	});

	it('returns exclusions for configured package@version', () => {
		const pkg = new PkgDesc('is-array', '1.0.1', __dirname);

		expect(project.copy.getExclusions(pkg)).toEqual([
			'test/**/*',
			'Makefile',
		]);
	});

	it('returns exclusions for configured package', () => {
		const pkg = new PkgDesc('is-object', '1.0.0', __dirname);

		expect(project.copy.getExclusions(pkg)).toEqual(['test/**/*']);
	});

	it('returns exclusions for unknown package', () => {
		const pkg = new PkgDesc('other-package', '1.0.0', __dirname);

		expect(project.copy.getExclusions(pkg)).toEqual(['__tests__/**/*']);
	});

	it('returns ["**/*"] when configured as true', () => {
		const pkg = new PkgDesc('is-true', '1.0.0', __dirname);

		expect(project.copy.getExclusions(pkg)).toEqual(['**/*']);
	});
});

describe('project.jar', () => {
	let project;

	beforeAll(() => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'standard')
		);
	});

	it('returns customManifestHeaders', () => {
		expect(project.jar.customManifestHeaders).toEqual({
			// Coming from .npmbundlerrc
			Responsible: 'john.doe@somewhere.net',
			// Coming from manifest.json
			'Project-Web': 'https://somewhere.net/test-project',
			'Project-UUID': 'ED7BA470-8E54-465E-825C-99712043E01C',
			// Coming from both, but .npmbundlerrc wins
			'Project-Name': 'Test Project',
		});
	});

	it('returns outputDir', () => {
		expect(project.jar.outputDir.asPosix).toBe('./dist');
	});

	it('returns supported', () => {
		expect(project.jar.supported).toBe(true);
	});

	it('returns webContextPath', () => {
		expect(project.jar.webContextPath).toBe('/standard');
	});
});

describe('project.jar.outputFilename', () => {
	it('returns correct file', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'standard')
		);

		expect(project.jar.outputFilename).toBe('output.jar');
	});

	it('returns package name and version if not specified', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'bool-create-jar')
		);

		expect(project.jar.outputFilename).toBe('bool-create-jar-1.0.0.jar');
	});
});

describe('project.jar.requireJsExtender', () => {
	it('returns true when create-jar config present and features/js-extender missing', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'create-jar-empty')
		);

		expect(project.jar.requireJsExtender).toBe(true);
	});

	it('returns false when create-jar config present and features/js-extender false', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'create-jar')
		);

		expect(project.jar.requireJsExtender).toBe(false);
	});
});

describe('project.jar.supported', () => {
	it('works with true boolean config', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'bool-create-jar')
		);

		expect(project.jar.supported).toBe(true);
	});

	it('works with false boolean config', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'false-create-jar')
		);

		expect(project.jar.supported).toBe(false);
	});
});

describe('project.l10n', () => {
	let project;

	beforeAll(() => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'standard')
		);
	});

	it('returns availableLocales', () => {
		expect(project.l10n.availableLocales).toEqual(['es_ES']);
	});

	it('returns labels for default locale', () => {
		expect(project.l10n.getLabels()).toEqual({
			'test-project': 'Test Project',
		});
	});

	it('returns labels for existing locale', () => {
		expect(project.l10n.getLabels('es_ES')).toEqual({
			'test-project': 'Proyecto de prueba',
		});
	});

	it('returns labels for missing locale', () => {
		expect(project.l10n.getLabels('fr_FR')).toEqual({});
	});

	it('returns languageFileBaseName', () => {
		expect(project.l10n.languageFileBaseName.asNative).toEqual(
			path.join(
				__dirname,
				'__fixtures__',
				'project',
				'standard',
				'features',
				'localization',
				'Language'
			)
		);
	});

	it('returns localizationFileMap', () => {
		expect(project.l10n.localizationFileMap).toEqual({
			default: new FilePath(
				path.join(
					__dirname,
					'__fixtures__',
					'project',
					'standard',
					'features',
					'localization',
					'Language.properties'
				)
			),
			es_ES: new FilePath(
				path.join(
					__dirname,
					'__fixtures__',
					'project',
					'standard',
					'features',
					'localization',
					'Language_es_ES.properties'
				)
			),
		});
	});

	it('returns supported', () => {
		expect(project.l10n.supported).toBe(true);
	});
});

describe('project.misc', () => {
	let project;

	beforeAll(() => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'standard')
		);
	});

	it('return maxParallelFiles', () => {
		expect(project.misc.maxParallelFiles).toBe(32);
	});
});

describe('project.pkgManager', () => {
	const savedSpawnSync = child_process.spawnSync;

	afterEach(() => {
		child_process.spawnSync = savedSpawnSync;
	});

	it('returns npm if only package-lock.json exists', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'npm')
		);

		expect(project.pkgManager).toBe('npm');
	});

	it('returns yarn if only yarn.lock exists', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'yarn')
		);

		expect(project.pkgManager).toBe('yarn');
	});

	it('returns npm if no file exists and only npm is found', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'none')
		);

		child_process.spawnSync = cmd => ({
			error: cmd === 'npm' ? undefined : {},
		});

		expect(project.pkgManager).toBe('npm');
	});

	it('returns yarn if no file exists and only yarn is found', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'none')
		);

		child_process.spawnSync = cmd => ({
			error: cmd === 'yarn' ? undefined : {},
		});

		expect(project.pkgManager).toBe('yarn');
	});

	it('returns npm if both files exists and only npm is found', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'both')
		);

		child_process.spawnSync = cmd => ({
			error: cmd === 'npm' ? undefined : {},
		});

		expect(project.pkgManager).toBe('npm');
	});

	it('returns yarn if both files exist and only yarn is found', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'both')
		);

		child_process.spawnSync = cmd => ({
			error: cmd === 'yarn' ? undefined : {},
		});

		expect(project.pkgManager).toBe('yarn');
	});

	it('returns null if both files exist and npm and yarn is found', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'both')
		);

		child_process.spawnSync = () => ({
			error: undefined,
		});

		expect(project.pkgManager).toBeNull();
	});
});

describe('project.transform', () => {
	let project;

	beforeAll(() => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'transform')
		);
	});

	it('loads default "pre" plugins correctly', () => {
		const pkg = new PkgDesc('package-star', '1.0.0', __dirname);

		const plugins = project.transform.getPrePluginDescriptors(pkg);

		expect(plugins[0].run({}, {})).toEqual(0);
		expect(plugins[0].config).toEqual({});

		expect(plugins[1].run({}, {})).toEqual(1);
		expect(plugins[1].config).toEqual('config-1');
	});

	it('loads default "post" plugins correctly', () => {
		const pkg = new PkgDesc('package-star', '1.0.0', __dirname);

		const plugins = project.transform.getPostPluginDescriptors(pkg);

		expect(plugins[0].run({}, {})).toEqual(2);
		expect(plugins[0].config).toEqual({});

		expect(plugins[1].run({}, {})).toEqual(3);
		expect(plugins[1].config).toEqual('config-3');
	});

	it('loads per-package "pre" plugins correctly', () => {
		const pkg = new PkgDesc('package', '1.0.0', __dirname);

		const plugins = project.transform.getPrePluginDescriptors(pkg);

		expect(plugins[0].run({}, {})).toEqual(4);
		expect(plugins[0].config).toEqual({});

		expect(plugins[1].run({}, {})).toEqual(5);
		expect(plugins[1].config).toEqual('config-5');
	});

	it('loads per-package "post" plugins correctly', () => {
		const pkg = new PkgDesc('package', '1.0.0', __dirname);

		const plugins = project.transform.getPostPluginDescriptors(pkg);

		expect(plugins[0].run({}, {})).toEqual(6);
		expect(plugins[0].config).toEqual({});

		expect(plugins[1].run({}, {})).toEqual(7);
		expect(plugins[1].config).toEqual('config-7');
	});

	it('loads default babel config correctly', () => {
		const pkg = new PkgDesc('package-star', '1.0.0', __dirname);

		const config = project.transform.getBabelConfig(pkg);

		expect(config).toEqual({config: 'config-*'});
	});

	it('loads per-package-by-id babel config correctly', () => {
		const pkg = new PkgDesc('package', '1.0.0', __dirname);

		const config = project.transform.getBabelConfig(pkg);

		expect(config).toEqual({config: 'config-package@1.0.0'});
	});

	it('loads per-package-by-name babel config correctly', () => {
		const pkg = new PkgDesc('package2', '1.0.0', __dirname);

		const config = project.transform.getBabelConfig(pkg);

		expect(config).toEqual({config: 'config-package2'});
	});

	it('loads babel plugins correctly', () => {
		const pkg = new PkgDesc('package3', '1.0.0', __dirname);

		const pluginMocks = {
			raw: () => false,
			configured: () => false,
		};

		jest.spyOn(project, 'toolResolve').mockImplementation(
			moduleName => moduleName
		);
		jest.spyOn(project, 'toolRequire').mockImplementation(
			moduleName => pluginMocks[moduleName]
		);

		try {
			const plugins = project.transform.getBabelPlugins(pkg);

			expect(plugins).toEqual([
				pluginMocks['raw'],
				[pluginMocks['configured'], {the: 'config'}],
			]);
		} finally {
			jest.restoreAllMocks();
		}
	});
});

describe('project.versionsInfo', () => {
	it('works', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'versions-info')
		);

		const versions = project.versionsInfo;

		expect(versions.size).toEqual(12);

		expect(versions.get('liferay-npm-bundler')).toMatchObject({
			version: require('../../../package.json').version,
			path: path.join(
				'..',
				'..',
				'..',
				'..',
				'..',
				'..',
				'..',
				'..',
				'node_modules',
				'liferay-npm-bundler'
			),
		});

		expect(versions.get('liferay-npm-build-tools-common')).toMatchObject({
			version: require('../../../package.json').version,
			path: path.join('..', '..', '..', '..', '..', '..'),
		});

		expect(versions.get('loader-0')).toMatchObject({
			version: '1.0.0',
			path: path.join('node_modules', 'loader-0'),
		});

		expect(versions.get('liferay-npm-bundler-plugin-test-0')).toMatchObject(
			{
				version: '1.0.0',
				path: path.join(
					'node_modules',
					'liferay-npm-bundler-plugin-test-0'
				),
			}
		);

		expect(versions.get('bundler-plugins/dir/plugin-0')).toMatchObject({
			version: '1.0.0',
			path: path.join('node_modules', 'bundler-plugins/dir/plugin-0.js'),
		});

		expect(versions.get('liferay-npm-bundler-plugin-test-1')).toMatchObject(
			{
				version: '1.0.0',
				path: path.join(
					'node_modules',
					'liferay-npm-bundler-plugin-test-1'
				),
			}
		);

		expect(versions.get('bundler-plugins/dir/plugin-1')).toMatchObject({
			version: '1.0.0',
			path: path.join('node_modules', 'bundler-plugins/dir/plugin-1.js'),
		});

		expect(versions.get('babel-plugin-test-0')).toMatchObject({
			version: '1.0.0',
			path: path.join('node_modules', 'babel-plugin-test-0'),
		});

		expect(versions.get('babel-plugins/dir/plugin-0')).toMatchObject({
			version: '1.0.0',
			path: path.join('node_modules', 'babel-plugins/dir/plugin-0.js'),
		});

		expect(versions.get('babel-plugins/dir/plugin-1')).toMatchObject({
			version: '1.0.0',
			path: path.join('node_modules', 'babel-plugins/dir/plugin-1.js'),
		});

		expect(versions.get('loader-0')).toMatchObject({
			version: '1.0.0',
			path: path.join('node_modules', 'loader-0'),
		});

		expect(versions.get('bundler-plugins/dir/loader-0')).toMatchObject({
			version: '1.0.0',
			path: path.join('node_modules', 'bundler-plugins/dir/loader-0.js'),
		});

		expect(versions.get('bundler-plugins/dir/loader-1')).toMatchObject({
			version: '1.0.0',
			path: path.join('node_modules', 'bundler-plugins/dir/loader-1.js'),
		});
	});
});

////////////////////////////////////////////////////////////////////////////////
// Tests by orthogonal features
////////////////////////////////////////////////////////////////////////////////

describe('default features are detected', () => {
	it('project.l10n.languageFileBaseName', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'default-features')
		);

		expect(project.l10n.languageFileBaseName.asNative).toBe(
			path.join(
				project.dir.asNative,
				'features',
				'localization',
				'Language'
			)
		);
	});
});

describe('deprecated config', () => {
	describe('.npmbundlerrc', () => {
		it('create-jar/auto-deploy-portlet', () => {
			const project = new Project(
				path.join(
					__dirname,
					'__fixtures__',
					'legacy',
					'auto-deploy-portlet'
				)
			);

			expect(project.jar.requireJsExtender).toBe(false);
		});

		it('create-jar/web-context-path', () => {
			const project = new Project(
				path.join(__dirname, '__fixtures__', 'legacy', 'context-path-1')
			);

			expect(project.jar.webContextPath).toBe('/my-portlet');
		});

		it('supports legacy package configurations correctly', () => {
			const project = new Project(
				path.join(__dirname, '__fixtures__', 'legacy', 'packages-cfg')
			);

			const pkg1 = new PkgDesc('package', '1.0.0', __dirname);
			const pkg2 = new PkgDesc('package2', '1.0.0', __dirname);
			const pkg3 = new PkgDesc('package3', '1.0.0', __dirname);
			const pkgOther = new PkgDesc('other-package', '1.0.0', __dirname);

			let plugins = project.transform.getPrePluginDescriptors(pkg1);
			expect(plugins[0].run({}, {})).toEqual(1);

			plugins = project.transform.getPrePluginDescriptors(pkg2);
			expect(plugins[0].run({}, {})).toEqual(2);

			plugins = project.transform.getPrePluginDescriptors(pkg3);
			expect(plugins[0].run({}, {})).toEqual(4);

			plugins = project.transform.getPrePluginDescriptors(pkgOther);
			expect(plugins[0].run({}, {})).toEqual(0);
		});
	});

	describe('package.json', () => {
		it('osgi/web-context-path', () => {
			const project = new Project(
				path.join(__dirname, '__fixtures__', 'legacy', 'context-path-2')
			);

			expect(project.jar.webContextPath).toBe('/my-portlet');
		});
	});
});

describe('empty project defaults', () => {
	let project;

	beforeAll(() => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'empty')
		);
	});

	it('loads liferay-npm-bundler-preset-standard preset', () => {
		expect(project._npmbundlerrc['*']['.babelrc']['presets']).toEqual([
			'liferay-standard',
		]);
	});

	it('returns dir', () => {
		expect(project.dir.toString()).toBe(
			path.join(__dirname, '__fixtures__', 'project', 'empty')
		);
	});

	it('returns buildDir', () => {
		expect(project.buildDir.asPosix).toBe(
			'./build/resources/main/META-INF/resources'
		);
	});

	it('return maxParallelFiles', () => {
		expect(project.misc.maxParallelFiles).toBe(128);
	});

	describe('project.jar', () => {
		it('returns customManifestHeaders', () => {
			expect(project.jar.customManifestHeaders).toEqual({});
		});

		it('returns outputDir', () => {
			expect(project.jar.outputDir).toBeUndefined();
		});

		it('returns outputFilename', () => {
			expect(project.jar.outputFilename).toBeUndefined();
		});

		it('returns supported', () => {
			expect(project.jar.supported).toBe(false);
		});

		it('returns webContextPath', () => {
			expect(project.jar.webContextPath).toBe('/empty-1.0.0');
		});
	});

	describe('project.l10n', () => {
		it('returns availableLocales', () => {
			expect(project.l10n.availableLocales).toBeUndefined();
		});

		it('returns labels for default locale', () => {
			expect(project.l10n.getLabels()).toBeUndefined();
		});

		it('returns labels for missing locale', () => {
			expect(project.l10n.getLabels('fr_FR')).toBeUndefined();
		});

		it('returns languageFileBaseName', () => {
			expect(project.l10n.languageFileBaseName).toBeUndefined();
		});

		it('returns localizationFileMap', () => {
			expect(project.l10n.localizationFileMap).toBeUndefined();
		});

		it('returns supported', () => {
			expect(project.l10n.supported).toBe(false);
		});
	});
});

describe('honors presets', () => {
	let project;

	beforeAll(() => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'with-preset')
		);
	});

	it('loads project.dir from preset', () => {
		expect(project.dir.asNative).toBe(
			path.join(__dirname, '__fixtures__', 'project', 'with-preset')
		);
	});

	it('loads project.buildDir from preset', () => {
		expect(project.buildDir.asPosix).toBe('./preset-build');
	});

	it('loads project.jar.outputDir from preset', () => {
		expect(project.jar.outputDir.asPosix).toBe('./preset-dist');
	});

	it('detects JAR configuration even if only in preset', () => {
		expect(project.jar.supported).toBe(true);
	});
});

describe('loads plugins as modules (as opposed to packages)', () => {
	let project;

	beforeAll(() => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'with-module-cfg')
		);
	});

	it('loads preset from file in package', () => {
		expect(project.buildDir.asPosix).toBe('./preset-output');
	});

	it('loads loaders from module in package', () => {
		const loaders = project.rules.loadersForFile('src/index.js');

		expect(loaders).toHaveLength(1);

		const loader = loaders[0];

		expect(loader).toMatchObject({
			loader: 'a-config/my-js-loader',
			options: {},
			resolvedModule: 'a-config/my-js-loader',
		});
		expect(loader.exec()).toBe('Hi from loader!');
	});

	it('loads copy plugins from module in package', () => {
		const pkg = new PkgDesc(
			'a-package',
			'1.0.0',
			project.dir.join('node_modules', 'a-package').asNative
		);

		const pluginDescriptors = project.copy.getPluginDescriptors(pkg);

		expect(pluginDescriptors).toHaveLength(1);

		const pluginDescriptor = pluginDescriptors[0];

		expect(pluginDescriptor).toMatchObject({
			name: 'a-config/my-copy-plugin',
			config: {},
		});

		expect(pluginDescriptor.run()).toBe('Hi from plugin!');
	});

	it('loads pre plugins from module in package', () => {
		const pkg = new PkgDesc(
			'a-package',
			'1.0.0',
			project.dir.join('node_modules', 'a-package').asNative
		);

		const pluginDescriptors = project.transform.getPrePluginDescriptors(
			pkg
		);

		expect(pluginDescriptors).toHaveLength(1);

		const pluginDescriptor = pluginDescriptors[0];

		expect(pluginDescriptor).toMatchObject({
			name: 'a-config/my-pre-plugin',
			config: {},
		});

		expect(pluginDescriptor.run()).toBe('Hi from pre plugin!');
	});

	it('loads post plugins from module in package', () => {
		const pkg = new PkgDesc(
			'a-package',
			'1.0.0',
			project.dir.join('node_modules', 'a-package').asNative
		);

		const pluginDescriptors = project.transform.getPostPluginDescriptors(
			pkg
		);

		expect(pluginDescriptors).toHaveLength(1);

		const pluginDescriptor = pluginDescriptors[0];

		expect(pluginDescriptor).toMatchObject({
			name: 'a-config/my-post-plugin',
			config: {},
		});

		expect(pluginDescriptor.run()).toBe('Hi from post plugin!');
	});

	it('loads babel plugins from module in package', () => {
		const pkg = new PkgDesc(
			'a-package',
			'1.0.0',
			project.dir.join('node_modules', 'a-package').asNative
		);

		const babelPlugins = project.transform.getBabelPlugins(pkg);

		expect(babelPlugins).toHaveLength(2);

		expect(babelPlugins[0]()).toBe("Hi from preset's babel plugin!");
		expect(babelPlugins[1]()).toBe('Hi from babel plugin!');
	});
});

describe('specific features', () => {
	describe('project.jar works with boolean config', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'bool-create-jar')
		);

		expect(project.jar.supported).toBe(true);
		expect(project.jar.customManifestHeaders).toEqual({});
		expect(project.jar.outputDir.asNative).toBe(project.buildDir.asNative);
		expect(project.jar.outputFilename).toBe('bool-create-jar-1.0.0.jar');
	});
});
