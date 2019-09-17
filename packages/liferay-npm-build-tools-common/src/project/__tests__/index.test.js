/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import child_process from 'child_process';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import path from 'path';

import {Project} from '../index';

let project;

describe('empty project', () => {
	beforeEach(() => {
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
			expect(project.l10n.availableLocales).toEqual([]);
		});

		it('returns labels for default locale', () => {
			expect(project.l10n.getLabels()).toEqual({});
		});

		it('returns labels for missing locale', () => {
			expect(project.l10n.getLabels('fr_FR')).toEqual({});
		});

		it('returns languageFileBaseName', () => {
			expect(project.l10n.languageFileBaseName).toBeUndefined();
		});

		it('returns localizationFileMap', () => {
			expect(project.l10n.localizationFileMap).toEqual({});
		});

		it('returns supported', () => {
			expect(project.l10n.supported).toBe(false);
		});
	});
});

describe('standard project', () => {
	beforeEach(() => {
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

	describe('project.jar', () => {
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

		it('returns outputFilename', () => {
			expect(project.jar.outputFilename).toBe('output.jar');
		});

		it('returns supported', () => {
			expect(project.jar.supported).toBe(true);
		});

		it('returns webContextPath', () => {
			expect(project.jar.webContextPath).toBe('/standard');
		});
	});

	describe('project.l10n', () => {
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
});

describe('specific features', () => {
	describe('project.jar works with boolean config', () => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'bool-create-jar')
		);

		expect(project.jar.supported).toBe(true);
		expect(project.jar.customManifestHeaders).toEqual({});
		expect(project.jar.outputDir.asNative).toBe(project.buildDir.asNative);
		expect(project.jar.outputFilename).toBe('bool-create-jar-1.0.0.jar');
	});
});

describe('honors presets', () => {
	beforeEach(() => {
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

describe('project.jar.outputFilename', () => {
	it('returns package name and version if not specified', () => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'bool-create-jar')
		);

		expect(project.jar.outputFilename).toBe('bool-create-jar-1.0.0.jar');
	});
});

describe('project.jar.supported', () => {
	it('works with true boolean config', () => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'bool-create-jar')
		);

		expect(project.jar.supported).toBe(true);
	});

	it('works with false boolean config', () => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'project', 'false-create-jar')
		);

		expect(project.jar.supported).toBe(false);
	});
});

describe('project.pkgManager', () => {
	const savedSpawnSync = child_process.spawnSync;

	afterEach(() => {
		child_process.spawnSync = savedSpawnSync;
	});

	it('returns npm if only package-lock.json exists', () => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'npm')
		);

		expect(project.pkgManager).toBe('npm');
	});

	it('returns yarn if only yarn.lock exists', () => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'yarn')
		);

		expect(project.pkgManager).toBe('yarn');
	});

	it('returns npm if no file exists and only npm is found', () => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'none')
		);

		child_process.spawnSync = cmd => ({
			error: cmd === 'npm' ? undefined : {},
		});

		expect(project.pkgManager).toBe('npm');
	});

	it('returns yarn if no file exists and only yarn is found', () => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'none')
		);

		child_process.spawnSync = cmd => ({
			error: cmd === 'yarn' ? undefined : {},
		});

		expect(project.pkgManager).toBe('yarn');
	});

	it('returns npm if both files exists and only npm is found', () => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'both')
		);

		child_process.spawnSync = cmd => ({
			error: cmd === 'npm' ? undefined : {},
		});

		expect(project.pkgManager).toBe('npm');
	});

	it('returns yarn if both files exist and only yarn is found', () => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'both')
		);

		child_process.spawnSync = cmd => ({
			error: cmd === 'yarn' ? undefined : {},
		});

		expect(project.pkgManager).toBe('yarn');
	});

	it('returns null if both files exist and npm and yarn is found', () => {
		project = new Project(
			path.join(__dirname, '__fixtures__', 'pkg-manager', 'both')
		);

		child_process.spawnSync = () => ({
			error: undefined,
		});

		expect(project.pkgManager).toBeNull();
	});
});

describe('default features are detected', () => {
	it('project.l10n.languageFileBaseName', () => {
		project = new Project(
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
		it('create-jar/web-context-path', () => {
			project = new Project(
				path.join(__dirname, '__fixtures__', 'legacy', 'context-path-1')
			);

			expect(project.jar.webContextPath).toBe('/my-portlet');
		});
	});

	describe('package.json', () => {
		it('osgi/web-context-path', () => {
			project = new Project(
				path.join(__dirname, '__fixtures__', 'legacy', 'context-path-2')
			);

			expect(project.jar.webContextPath).toBe('/my-portlet');
		});
	});
});
