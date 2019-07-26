/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import fs from 'fs';
import path from 'path';
import readJsonSync from 'read-json-sync';

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

		const npmbundlerrcPath = path.join(projectDir, '.npmbundlerrc');

		this._npmbundlerrc = fs.existsSync(npmbundlerrcPath)
			? readJsonSync(npmbundlerrcPath)
			: {};

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
}

export default new Project('.');
