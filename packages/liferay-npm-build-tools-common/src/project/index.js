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

/**
 * Describes a standard JS Toolkit project.
 */
export class Project {
	/**
	 * @param {string} projectDir project's path
	 */
	constructor(projectDir) {
		this._projectDir = projectDir;

		this._loadPkgJson();
		this._loadNpmbundlerrc();

		const pkgJsonPath = path.join(projectDir, 'package.json');

		this._pkgJson = fs.existsSync(pkgJsonPath)
			? readJsonSync(pkgJsonPath)
			: {};

		this._buildDir = undefined;

		this.jar = new Jar(this);
		this.l10n = new Localization(this);
	}

	/**
	 * Get directory where files to be transformed live.
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

			this._buildDir = path.normalize(dir);
		}

		return this._buildDir;
	}

	/**
	 * Get project's directory
	 */
	get dir() {
		return this._projectDir;
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
