/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import fs from 'fs';
import merge from 'merge';
import path from 'path';
import readJsonSync from 'read-json-sync';
import resolveModule from 'resolve';

import Jar from './jar';
import Localization from './localization';
import Probe from './probe';
import Rules from './rules';
import {mixinAsPlatform} from './util';

/**
 * Describes a standard JS Toolkit project.
 */
export class Project {
	/**
	 * @param {string} projectDir project's path
	 */
	constructor(projectDir) {
		this.loadFrom(projectDir);
	}

	/**
	 * Get directories inside the project containing source files.
	 * @return {Array<sring>} directory names relative to `project.dir`
	 */
	get sources() {
		if (this._sources === undefined) {
			this._sources = prop.get(this._npmbundlerrc, 'sources', []);

			mixinAsPlatform(this._sources);
		}

		return this._sources;
	}

	/**
	 * Get directory where files to be transformed live relative to
	 * `this.dir` and starting with `./`
	 * @return {string} the directory path (with native separators)
	 */
	get buildDir() {
		if (this._buildDir === undefined) {
			const dir = prop.get(
				this._npmbundlerrc,
				'output',
				this.jar.supported
					? 'build'
					: 'build/resources/main/META-INF/resources'
			);

			this._buildDir =
				'.' +
				path.sep +
				path.relative(this.dir, path.join(this.dir, dir));
		}

		return this._buildDir;
	}

	/**
	 * Get project's directory
	 * @return {string} an absolute path to project's directory
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
	 * test.
	 * @param {string} projectDir
	 */
	loadFrom(projectDir) {
		this._projectDir = path.resolve(projectDir);

		this._loadPkgJson();
		this._loadNpmbundlerrc();

		const pkgJsonPath = path.join(projectDir, 'package.json');

		this._pkgJson = fs.existsSync(pkgJsonPath)
			? readJsonSync(pkgJsonPath)
			: {};

		this._sources = undefined;
		this._buildDir = undefined;

		this.jar = new Jar(this);
		this.l10n = new Localization(this);
		this.probe = new Probe(this);
		this.rules = new Rules(this);
	}

	/**
	 * Requires a module in the context of the project (as opposed to the
	 * context of the calling package which would just use a normal `require()`
	 * call).
	 * @param {string} moduleName
	 */
	require(moduleName) {
		const modulePath = resolveModule.sync(moduleName, {
			basedir: this._projectDir,
		});

		return require(modulePath);
	}

	_loadNpmbundlerrc() {
		const npmbundlerrcPath = path.join(this._projectDir, '.npmbundlerrc');

		const config = fs.existsSync(npmbundlerrcPath)
			? readJsonSync(npmbundlerrcPath)
			: {};

		// Apply preset if necessary
		let presetFile;

		if (config.preset === undefined) {
			presetFile = require.resolve('liferay-npm-bundler-preset-standard');
		} else if (config.preset === '' || config.preset === false) {
			// don't load preset
		} else {
			presetFile = resolveModule.sync(config.preset, {
				basedir: this._projectDir,
			});
		}

		if (presetFile) {
			const originalConfig = Object.assign({}, config);

			Object.assign(
				config,
				merge.recursive(readJsonSync(presetFile), originalConfig)
			);
		}

		this._npmbundlerrc = config;
	}

	_loadPkgJson() {
		this._pkgJson = readJsonSync(
			path.join(this._projectDir, 'package.json')
		);
	}
}

export default new Project('.');
