/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import child_process from 'child_process';
import prop from 'dot-prop';
import fs from 'fs';
import merge from 'merge';
import path from 'path';
import readJsonSync from 'read-json-sync';
import resolveModule from 'resolve';

import FilePath from '../file-path';
import {splitModuleName} from '../modules';
import Copy from './copy';
import Jar from './jar';
import Localization from './localization';
import Misc from './misc';
import Probe from './probe';
import Rules from './rules';
import Transform from './transform';
import {VersionInfo} from './types';

/** A package manager */
export type PkgManager = 'npm' | 'yarn' | null;

/**
 * Describes a standard JS Toolkit project.
 */
export class Project {
	copy: Copy;
	jar: Jar;
	l10n: Localization;
	misc: Misc;
	probe: Probe;
	rules: Rules;
	transform: Transform;

	/**
	 * @param projectDirPath project's path in native format
	 */
	constructor(projectDirPath: string) {
		this.loadFrom(projectDirPath);
	}

	/**
	 * Get directories inside the project containing source files starting with
	 * `./` (so that they can be safely path.joined)
	 */
	get sources(): FilePath[] {
		if (this._sources === undefined) {
			this._sources = prop
				.get(this._npmbundlerrc, 'sources', [])
				.map(source =>
					source.startsWith('./') ? source : `./${source}`
				)
				.map(source => new FilePath(source, {posix: true}));
		}

		return this._sources;
	}

	/**
	 * Get directory where files to be transformed live relative to
	 * `this.dir` and starting with `./` (so that it can be safely path.joined)
	 */
	get buildDir(): FilePath {
		if (this._buildDir === undefined) {
			let dir = prop.get(
				this._npmbundlerrc,
				'output',
				this.jar.supported
					? './build'
					: './build/resources/main/META-INF/resources'
			);

			if (!dir.startsWith('./')) {
				dir = `./${dir}`;
			}

			this._buildDir = new FilePath(dir, {posix: true});
		}

		return this._buildDir;
	}

	/**
	 * Get absolute path to project's directory.
	 */
	get dir(): FilePath {
		return this._projectDir;
	}

	/**
	 * Get global plugins configuration.
	 */
	get globalConfig(): object {
		const {_npmbundlerrc} = this;

		return prop.get(_npmbundlerrc, 'config', {});
	}

	/**
	 * Get project's parsed .npmbundlerrc file
	 */
	get npmbundlerrc(): object {
		return this._npmbundlerrc;
	}

	/**
	 * Get project's parsed package.json file
	 */
	get pkgJson(): object {
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
			} else if (pkgLockPresent) {
				this._pkgManager = 'npm';
			} else {
				// If no file is found autodetect command availability
				let yarnPresent =
					child_process.spawnSync('yarn', ['--version'], {
						shell: true,
					}).error === undefined;
				let npmPresent =
					child_process.spawnSync('npm', ['--version'], {
						shell: true,
					}).error === undefined;

				// If both present act as if none was present
				if (yarnPresent && npmPresent) {
					yarnPresent = npmPresent = false;
				}

				if (yarnPresent) {
					this._pkgManager = 'yarn';
				} else if (npmPresent) {
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
			let map = new Map<string, VersionInfo>();

			const putInMap = packageName => {
				const pkgJsonPath = this.toolResolve(
					`${packageName}/package.json`
				);
				const pkgJson = require(pkgJsonPath);

				map.set(pkgJson.name, {
					version: pkgJson.version,
					path: path.relative(
						this.dir.asNative,
						path.dirname(pkgJsonPath)
					),
				});
			};

			// Get bundler and me versions
			putInMap('liferay-npm-bundler');
			putInMap(path.join(__dirname, '../..'));

			// Get preset version
			const {_npmbundlerrc} = this;
			const preset = _npmbundlerrc['preset'];

			if (preset) {
				putInMap(splitModuleName(preset).pkgName);
			}

			map = new Map([...map, ...this.transform.versionsInfo]);
			map = new Map([...map, ...this.rules.versionsInfo]);

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
		configFilePath: string = '.npmbundlerrc'
	): void {
		// First reset everything
		this._buildDir = undefined;
		this._configFile = undefined;
		this._npmbundlerrc = undefined;
		this._pkgJson = undefined;
		this._pkgManager = undefined;
		this._projectDir = undefined;
		this._sources = undefined;
		this._toolsDir = undefined;

		// Set significant directories
		this._projectDir = new FilePath(path.resolve(projectPath));
		this._configFile = new FilePath(
			path.isAbsolute(configFilePath)
				? configFilePath
				: path.resolve(path.join(projectPath, configFilePath))
		);
		this._toolsDir = this._projectDir;

		// Load configuration files
		this._loadPkgJson();
		this._loadNpmbundlerrc();

		// Initialize subdomains
		this.copy = new Copy(this);
		this.jar = new Jar(this);
		this.l10n = new Localization(this);
		this.misc = new Misc(this);
		this.probe = new Probe(this);
		this.rules = new Rules(this);
		this.transform = new Transform(this);
	}

	/**
	 * Requires a module in the context of the project (as opposed to the
	 * context of the calling package which would just use a normal `require()`
	 * call).
	 * @param moduleName
	 */
	require(moduleName: string): any {
		return require(this.resolve(moduleName));
	}

	/**
	 * Resolves a module in the context of the project (as opposed to the
	 * context of the calling package which would just use a normal
	 * `require.resolve()` call).
	 * @param moduleName
	 */
	resolve(moduleName: string): any {
		return resolveModule.sync(moduleName, {
			basedir: this.dir.asNative,
		});
	}

	/**
	 * Set program arguments so that some of them can be parsed as if they were
	 * `.npmbundlerrc` options.
	 */
	set argv(argv: {
		config: string;
		'create-jar': boolean;
		'dump-report': boolean;
	}) {
		const {_npmbundlerrc} = this;

		if (argv.config) {
			this.loadFrom('.', argv.config);
		}

		if (argv['create-jar']) {
			_npmbundlerrc['create-jar'] = true;
		}

		if (argv['dump-report']) {
			_npmbundlerrc['dump-report'] = true;
		}
	}

	/**
	 * Requires a tool module in the context of the project (as opposed to the
	 * context of the calling package which would just use a normal `require()`
	 * call).
	 *
	 * @remarks
	 * This looks in the `.npmbundlerrc` preset before calling the standard
	 * {@link require} method.
	 *
	 * @param moduleName
	 * @throws if module is not found
	 */
	toolRequire(moduleName: string): any {
		return require(this.toolResolve(moduleName));
	}

	/**
	 * Resolves a tool module in the context of the project (as opposed to the
	 * context of the calling package which would just use a normal
	 * `require.resolve()` call).
	 *
	 * @remarks
	 * This looks in the `.npmbundlerrc` preset before calling the standard
	 * {@link require} method.x
	 *
	 * @param moduleName
	 * @throws if module is not found
	 */
	toolResolve(moduleName: string): any {
		try {
			return resolveModule.sync(moduleName, {
				basedir: this._toolsDir.asNative,
			});
		} catch (err) {
			return this.resolve(moduleName);
		}
	}

	_loadNpmbundlerrc(): void {
		const npmbundlerrcPath = this._configFile.asNative;

		const config = fs.existsSync(npmbundlerrcPath)
			? readJsonSync(npmbundlerrcPath)
			: {};

		// Apply preset if necessary
		let presetFilePath;

		if (config.preset === undefined) {
			presetFilePath = require.resolve(
				'liferay-npm-bundler-preset-standard'
			);

			this._toolsDir = new FilePath(
				path.dirname(
					require.resolve(
						'liferay-npm-bundler-preset-standard/package.json'
					)
				)
			);
		} else if (config.preset === '' || config.preset === false) {
			// don't load preset
		} else {
			presetFilePath = resolveModule.sync(config.preset, {
				basedir: this.dir.asNative,
			});

			const {pkgName} = splitModuleName(config.preset);

			const presetPkgJsonFilePath = resolveModule.sync(
				`${pkgName}/package.json`,
				{
					basedir: this.dir.asNative,
				}
			);

			this._toolsDir = new FilePath(path.dirname(presetPkgJsonFilePath));
		}

		if (presetFilePath) {
			const originalConfig = Object.assign({}, config);

			Object.assign(
				config,
				merge.recursive(readJsonSync(presetFilePath), originalConfig)
			);
		}

		this._npmbundlerrc = config;
	}

	_loadPkgJson(): void {
		const pkgJsonPath = this.dir.join('package.json').asNative;

		this._pkgJson = fs.existsSync(pkgJsonPath)
			? readJsonSync(pkgJsonPath)
			: {};
	}

	/** Project relative path to build directory */
	private _buildDir: FilePath;

	/** Absolute path to config file */
	private _configFile: FilePath;

	private _npmbundlerrc: object;
	private _pkgJson: object;
	private _pkgManager: PkgManager;

	/** Absolute path to project directory */
	private _projectDir: FilePath;

	/** Project relative paths to source directories */
	private _sources: FilePath[];

	/** Absolute path to tools directory (usually project or preset dir) */
	private _toolsDir: FilePath;

	private _versionsInfo: Map<string, VersionInfo>;
}

export default new Project('.');
