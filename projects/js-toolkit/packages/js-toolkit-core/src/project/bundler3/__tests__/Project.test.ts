/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import child_process from 'child_process';
import path from 'path';

import FilePath from '../../file/FilePath';
import Project from '../Project';

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

	it('returns outputDir', () => {
		expect(project.outputDir).toEqual(project.dir.join('./build'));
	});

	it('returns globalConfig', () => {
		const {globalConfig} = project;

		expect(globalConfig.imports).toBeDefined();

		const expectedImports = [
			'an-osgi-module',
			'frontend-js-web',
			'frontend-js-node-shims',
		];

		expectedImports.map((v) => {
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

describe('project.jar', () => {
	let project;

	beforeAll(() => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'standard')
		);
	});

	it('returns customManifestHeaders', () => {
		expect(project.jar.customManifestHeaders).toEqual({

			// Coming from liferay-npm-bundler.config.js

			'Responsible': 'john.doe@somewhere.net',

			// Coming from manifest.json

			'Project-Web': 'https://somewhere.net/test-project',
			'Project-UUID': 'ED7BA470-8E54-465E-825C-99712043E01C',

			// Coming from both, but liferay-npm-bundler.config.js wins

			'Project-Name': 'Test Project',
		});
	});

	it('returns outputDir', () => {
		expect(project.jar.outputDir).toEqual(project.dir.join('./dist'));
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
	it('returns true when package.json has a portlet section', () => {
		const project = new Project(
			path.join(
				__dirname,
				'__fixtures__',
				'project',
				'empty-with-portlet'
			)
		);

		expect(project.jar.requireJsExtender).toBe(true);
	});

	it('returns false when package.json has no portlet section', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'empty')
		);

		expect(project.jar.requireJsExtender).toBe(false);
	});

	it('returns undefined when create-jar is false even if package.json has a portlet section', () => {
		const project = new Project(
			path.join(
				__dirname,
				'__fixtures__',
				'project',
				'create-jar-off-with-portlet'
			)
		);

		expect(project.jar.requireJsExtender).toBeUndefined();
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

		child_process.spawnSync = (cmd) =>
			({
				error: cmd === 'npm' ? undefined : {},
			} as any);

		expect(project.pkgManager).toBe('npm');
	});

	it('returns yarn if no file exists and only yarn is found', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'none')
		);

		child_process.spawnSync = (cmd) =>
			({
				error: cmd === 'yarn' ? undefined : {},
			} as any);

		expect(project.pkgManager).toBe('yarn');
	});

	it('returns npm if both files exists and only npm is found', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'both')
		);

		child_process.spawnSync = (cmd) =>
			({
				error: cmd === 'npm' ? undefined : {},
			} as any);

		expect(project.pkgManager).toBe('npm');
	});

	it('returns yarn if both files exist and only yarn is found', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'both')
		);

		child_process.spawnSync = (cmd) =>
			({
				error: cmd === 'yarn' ? undefined : {},
			} as any);

		expect(project.pkgManager).toBe('yarn');
	});

	it('returns null if both files exist and npm and yarn is found', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'both')
		);

		child_process.spawnSync = () =>
			({
				error: undefined,
			} as any);

		expect(project.pkgManager).toBeNull();
	});
});

describe('project.versionsInfo', () => {
	it('works', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'versions-info')
		);

		const versions = project.versionsInfo;

		expect(versions).toEqual(
			new Map([
				[
					'@liferay/js-toolkit-core',
					{
						version: require('../../../package.json').version,
						path: path.join('..', '..', '..', '..', '..', '..'),
					},
				],
				[
					'@liferay/npm-bundler',
					{
						version: require(`../../../../../../../node_modules/@liferay/npm-bundler/package.json`)
							.version,
						path: path.join(
							'..',
							'..',
							'..',
							'..',
							'..',
							'..',
							'..',
							'..',
							'..',
							'..',
							'node_modules',
							'@liferay',
							'npm-bundler'
						),
					},
				],
			])
		);
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

describe('empty project defaults', () => {
	let project;

	beforeAll(() => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'empty')
		);
	});

	it('returns dir', () => {
		expect(project.dir.toString()).toBe(
			path.join(__dirname, '__fixtures__', 'project', 'empty')
		);
	});

	it('returns outputDir', () => {
		expect(project.outputDir).toEqual(project.dir.join('./build'));
	});

	it('return maxParallelFiles', () => {
		expect(project.misc.maxParallelFiles).toBe(128);
	});

	describe('project.jar', () => {
		it('returns customManifestHeaders', () => {
			expect(project.jar.customManifestHeaders).toEqual({});
		});

		it('returns outputDir', () => {
			expect(project.jar.outputDir).toEqual(project.dir.join('./build'));
		});

		it('returns outputFilename', () => {
			expect(project.jar.outputFilename).toBe('empty-1.0.0.jar');
		});

		it('returns supported', () => {
			expect(project.jar.supported).toBe(true);
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

describe('loads things as modules (as opposed to packages)', () => {
	let project;

	beforeAll(() => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'with-module-cfg')
		);
	});
});

describe('specific features', () => {
	describe('project.jar works with boolean config', () => {
		const project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'bool-create-jar')
		);

		expect(project.jar.supported).toBe(true);
		expect(project.jar.customManifestHeaders).toEqual({});
		expect(project.jar.outputDir.asNative).toBe(project.outputDir.asNative);
		expect(project.jar.outputFilename).toBe('bool-create-jar-1.0.0.jar');
	});
});
