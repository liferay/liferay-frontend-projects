/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import childProcess from 'child_process';
import prop from 'dot-prop';
import fs from 'fs';
import path from 'path';
import readJsonSync from 'read-json-sync';
import resolveModule from 'resolve';
import webpack from 'webpack';

import FilePath from '../file/FilePath';
import {info, print, warn} from '../format';
import {splitModuleName} from '../node/modules';
import PkgJson from '../schema/PkgJson';
import Adapt from './Adapt';
import Jar from './Jar';
import Localization from './Localization';
import Misc from './Misc';
import Probe from './Probe';
import VersionInfo from './VersionInfo';

/** Exports configuration */
export interface Exports {
	[id: string]: string;
}

/** Imports configuration */
export interface Imports {
	[pkgName: string]: ImportsConfig;
}

export interface ImportsConfig {
	provider: string;
	version: string;
}

/** A package manager */
export type PkgManager = 'npm' | 'yarn' | null;

/**
 * Describes a standard JS Toolkit project.
 */
export default class Project {
	adapt: Adapt;
	jar: Jar;
	l10n: Localization;
	misc: Misc;
	probe: Probe;

	/**
	 * @param projectDirPath project's path in native format
	 */
	constructor(projectDirPath: string) {
		this.loadFrom(projectDirPath);
	}

	/**
	 * Get absolute path to project's directory.
	 */
	get dir(): FilePath {
		return this._projectDir;
	}

	/** Get absolute path to output directory */
	get outputDir(): FilePath {
		if (this._outputDir === undefined) {
			this._outputDir = this.dir.join(
				new FilePath(
					prop.get(
						this._configuration,
						'output',
						this.adapt.supported ? './build.liferay' : './build'
					),
					{posix: true}
				)
			);
		}

		return this._outputDir;
	}

	/** Get absolute path to source directory */
	get sourceDir(): FilePath {
		if (this._sourceDir === undefined) {
			this._sourceDir = this.dir.join(
				new FilePath(prop.get(this._configuration, 'source', '.'), {
					posix: true,
				})
			);
		}

		return this._sourceDir;
	}

	/**
	 * Get absolute path to directory where work files must be placed.
	 *
	 * @remarks
	 * Work files are files that can be cached between different builds to speed
	 * the process or simply because they can help in debugging a failed build.
	 *
	 * @return the work dir or undefined if not configured
	 */
	get workDir(): FilePath | undefined {
		if (this._workDir === undefined) {
			this._workDir = this.dir.join(
				new FilePath(
					prop.get(this._configuration, 'workdir', './work'),
					{posix: true}
				)
			);
		}

		return this._workDir;
	}

	/**
	 * Get module paths	to export to the outside world making them available
	 * through the AMD loader.
	 *
	 * @remarks
	 * Note that the usual CommonJS syntax is used to differentiate local
	 * modules from dependency (node_modules) modules.
	 *
	 * For example:
	 *
	 * - Local module: './src/my-api'
	 * - Dependency module: 'lodash/trimEnd'
	 */
	get exports(): Exports {
		if (this._exports === undefined) {
			this._exports = prop.get(this._configuration, 'exports', {});

			// Export package.json's main entry (if present) automatically

			if (!this._exports['main']) {
				let main = this._pkgJson.main;

				if (main) {
					if (main.startsWith('/')) {
						main = `.${main}`;
					}
					else if (!main.startsWith('.')) {
						main = `./${main}`;
					}

					this._exports['main'] = main;
				}
				else if (
					fs.existsSync(this.sourceDir.join('index.js').asNative)
				) {
					this._exports['main'] = './index.js';
				}
			}
		}

		return this._exports;
	}

	get imports(): Imports {
		if (this._imports === undefined) {
			this._imports = {};

			const imports = prop.get(this._configuration, 'imports', {});

			Object.entries(imports).forEach(
				([provider, config]: [string, string]) => {
					Object.entries(config).forEach(
						([pkgName, version]: [string, string]) => {
							if (pkgName === '/') {
								pkgName = provider;
							}

							this._imports[pkgName] = {
								provider,
								version,
							};
						}
					);
				},
				{} as Imports
			);
		}

		return this._imports;
	}

	/**
	 * Get user's webpack configuration.
	 */
	get webpackConfiguration(): webpack.Configuration {
		if (this._webpackConfiguration === undefined) {
			this._webpackConfiguration = prop.get(
				this._configuration,
				'webpack',
				{}
			);
		}

		return this._webpackConfiguration;
	}

	/**
	 * Get directories inside the project containing source files starting with
	 * `./` (so that they can be safely path.joined)
	 */
	get sources(): FilePath[] {
		if (this._sources === undefined) {
			this._sources = prop
				.get(this._configuration, 'sources', [])
				.map((source) =>
					source.startsWith('./') ? source : `./${source}`
				)
				.map((source) => new FilePath(source, {posix: true}));
		}

		return this._sources;
	}

	/**
	 * Get global plugins configuration.
	 */
	get globalConfig(): object {
		const {_configuration} = this;

		return prop.get(_configuration, 'config', {});
	}

	/**
	 * Get project's parsed liferay-npm-bundler.config.js file
	 */
	get configuration(): object {
		return this._configuration;
	}

	/**
	 * Get project's parsed package.json file
	 */
	get pkgJson(): PkgJson {
		return this._pkgJson;
	}

	/**
	 * Return the package manager that the project is using or null if it cannot
	 * be inferred.
	 */
	get pkgManager(): PkgManager {
		if (this._pkgManager === undefined) {
			let yarnLockPresent = fs.existsSync(
				this._projectDir.join('yarn.lock').asNative
			);
			let pkgLockPresent = fs.existsSync(
				this._projectDir.join('package-lock.json').asNative
			);

			// If both present act as if none was present

			if (yarnLockPresent && pkgLockPresent) {
				yarnLockPresent = pkgLockPresent = false;
			}

			if (yarnLockPresent) {
				this._pkgManager = 'yarn';
			}
			else if (pkgLockPresent) {
				this._pkgManager = 'npm';
			}
			else {

				// If no file is found autodetect command availability

				let yarnPresent =
					childProcess.spawnSync('yarn', ['--version'], {
						shell: true,
					}).error === undefined;
				let npmPresent =
					childProcess.spawnSync('npm', ['--version'], {
						shell: true,
					}).error === undefined;

				// If both present act as if none was present

				if (yarnPresent && npmPresent) {
					yarnPresent = npmPresent = false;
				}

				if (yarnPresent) {
					this._pkgManager = 'yarn';
				}
				else if (npmPresent) {
					this._pkgManager = 'npm';
				}
			}

			// If nothing detected store null

			if (this._pkgManager === undefined) {
				this._pkgManager = null;
			}
		}

		return this._pkgManager;
	}

	/**
	 * Get all available information about versions of plugins and presets used
	 * for the build.
	 * @return a Map where keys are package names
	 */
	get versionsInfo(): Map<string, VersionInfo> {
		if (this._versionsInfo === undefined) {
			const map = new Map<string, VersionInfo>();

			const putInMap = (packageName): void => {
				const pkgJsonPath = this.resolve(`${packageName}/package.json`);
				// eslint-disable-next-line @typescript-eslint/no-var-requires, @liferay/no-dynamic-require
				const pkgJson = require(pkgJsonPath);

				map.set(pkgJson.name, {
					path: path.relative(
						this.dir.asNative,
						path.dirname(pkgJsonPath)
					),
					version: pkgJson.version,
				});
			};

			// Get bundler and me versions

			putInMap('@liferay/npm-bundler');
			putInMap(path.join(__dirname, '../..'));

			// Get preset version

			const {_configuration} = this;
			const preset = _configuration['preset'];

			if (preset) {
				putInMap(splitModuleName(preset).pkgName);
			}

			this._versionsInfo = map;
		}

		return this._versionsInfo;
	}

	/**
	 * Reload the whole project from given directory. Especially useful for
	 * tests.
	 * @param projectPath
	 * project's path in native format (whether absolute or relative to cwd)
	 * @param configFilePath
	 * optional path to configuration file (relative to `projectPath` if not
	 * given as an absolute path)
	 */
	loadFrom(
		projectPath: string,
		configFilePath = 'liferay-npm-bundler.config.js'
	): void {

		// First reset everything

		this._configFile = undefined;
		this._configuration = undefined;
		this._outputDir = undefined;
		this._pkgJson = undefined;
		this._pkgManager = undefined;
		this._projectDir = undefined;
		this._sources = undefined;
		this._sourceDir = undefined;
		this._workDir = undefined;

		// Set significant directories

		this._projectDir = new FilePath(path.resolve(projectPath));
		this._configFile = new FilePath(
			path.isAbsolute(configFilePath)
				? configFilePath
				: path.resolve(path.join(projectPath, configFilePath))
		);

		// Load configuration files

		this._loadPkgJson();
		this._loadConfiguration();

		// Initialize subdomains

		this.adapt = new Adapt(this);
		this.jar = new Jar(this);
		this.l10n = new Localization(this);
		this.misc = new Misc(this);
		this.probe = new Probe(this);
	}

	/**
	 * Requires a module in the context of the project (as opposed to the
	 * context of the calling package which would just use a normal `require()`
	 * call).
	 * @param moduleName
	 */
	require(moduleName: string): unknown {
		// eslint-disable-next-line @liferay/no-dynamic-require
		return require(this.resolve(moduleName));
	}

	/**
	 * Resolves a module in the context of the project (as opposed to the
	 * context of the calling package which would just use a normal
	 * `require.resolve()` call).
	 * @param moduleName
	 */
	resolve(moduleName: string): string {
		return resolveModule.sync(moduleName, {
			basedir: this.dir.asNative,
		});
	}

	/**
	 * Set program arguments so that some of them can be parsed as if they were
	 * `liferay-npm-bundler.config.js` options.
	 */
	set argv(argv: {
		'config': string;
		'create-jar': boolean;
		'dump-report': boolean;
	}) {
		const {_configuration} = this;

		if (argv.config) {
			this.loadFrom('.', argv.config);
		}

		if (argv['create-jar']) {
			_configuration['create-jar'] = true;
		}

		if (argv['dump-report']) {
			_configuration['dump-report'] = true;
		}
	}

	_loadConfiguration(): void {
		const {_configFile} = this;
		const configDir = _configFile.dirname();

		if (fs.existsSync(configDir.join('.npmbundlerrc').asNative)) {
			print(
				warn`There is a {.npmbundlerrc} file in {${configDir.basename()}}: it will be ignored`,
				info`Consider migrating the project to bundler 3.x or removing it if is a leftover`
			);
		}

		const configFilePath = _configFile.asNative;

		this._configuration = fs.existsSync(configFilePath)
			? // eslint-disable-next-line @liferay/no-dynamic-require
			  require(configFilePath)
			: {};
	}

	_loadPkgJson(): void {
		const pkgJsonPath = this.dir.join('package.json').asNative;

		this._pkgJson = fs.existsSync(pkgJsonPath)
			? readJsonSync(pkgJsonPath)
			: {};
	}

	/** Absolute path to config file */
	private _configFile: FilePath;

	private _configuration: object;
	private _pkgJson: PkgJson;
	private _pkgManager: PkgManager;

	/** Absolute path to project directory */
	private _projectDir: FilePath;

	private _outputDir: FilePath;
	private _sourceDir: FilePath;
	private _workDir: FilePath;

	/** Project relative paths to source directories */
	private _sources: FilePath[];

	/** Modules to export to the outside world */
	private _exports: Exports;

	/** Modules to import from the outside world */
	private _imports: Imports;

	/** User's webpack configuration */
	private _webpackConfiguration: webpack.Configuration;

	private _versionsInfo: Map<string, VersionInfo>;
}
