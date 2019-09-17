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
import Jar from './jar';
import Localization from './localization';
import Probe from './probe';
import Rules from './rules';

/**
 * Describes a standard JS Toolkit project.
 */
export class Project {
	/**
	 * @param {string} projectDirPath project's path in native format
	 */
	constructor(projectDirPath) {
		this.loadFrom(projectDirPath);
	}

	/**
	 * Get directories inside the project containing source files starting with
	 * `./` (so that they can be safely path.joined)
	 * @return {Array<FilePath>}
	 */
	get sources() {
		if (this._sources === undefined) {
			this._sources = FilePath.convertArray(
				prop
					.get(this._npmbundlerrc, 'sources', [])
					.map(source =>
						source.startsWith('./') ? source : `./${source}`
					),
				{posix: true}
			);
		}

		return this._sources;
	}

	/**
	 * Get directory where files to be transformed live relative to
	 * `this.dir` and starting with `./` (so that it can be safely path.joined)
	 * @return {FilePath}
	 */
	get buildDir() {
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
	 * @return {FilePath}
	 */
	get dir() {
		return this._projectDir;
	}

	/**
	 * Get project's parsed package.json file
	 */
	get pkgJson() {
		return this._pkgJson;
	}

	/**
	 * Reload the whole project from given directory. Especially useful for
	 * tests.
	 * @param {string} projectDir project's path in native format (whether
	 * 						absolute or relative to cwd)
	 */
	loadFrom(projectDir) {
		this._projectDir = new FilePath(path.resolve(projectDir));

		this._loadPkgJson();
		this._loadNpmbundlerrc();

		this._sources = undefined;
		this._buildDir = undefined;
		this._pkgManager = undefined;

		this.jar = new Jar(this);
		this.l10n = new Localization(this);
		this.probe = new Probe(this);
		this.rules = new Rules(this);
	}

	/**
	 * Return the package manager that the project is using.
	 * @return {string} one of 'npm', 'yarn' or null if it cannot be determined
	 */
	get pkgManager() {
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
	 * Requires a module in the context of the project (as opposed to the
	 * context of the calling package which would just use a normal `require()`
	 * call).
	 * @param {string} moduleName
	 */
	require(moduleName) {
		const modulePath = resolveModule.sync(moduleName, {
			basedir: this.dir.asNative,
		});

		return require(modulePath);
	}

	_loadNpmbundlerrc() {
		const npmbundlerrcPath = this._projectDir.join('.npmbundlerrc')
			.asNative;

		const config = fs.existsSync(npmbundlerrcPath)
			? readJsonSync(npmbundlerrcPath)
			: {};

		// Apply preset if necessary
		let presetFilePath;

		if (config.preset === undefined) {
			presetFilePath = require.resolve(
				'liferay-npm-bundler-preset-standard'
			);
		} else if (config.preset === '' || config.preset === false) {
			// don't load preset
		} else {
			presetFilePath = resolveModule.sync(config.preset, {
				basedir: this.dir.asNative,
			});
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

	_loadPkgJson() {
		const pkgJsonPath = this.dir.join('package.json').asNative;

		this._pkgJson = fs.existsSync(pkgJsonPath)
			? readJsonSync(pkgJsonPath)
			: {};
	}
}

export default new Project('.');
