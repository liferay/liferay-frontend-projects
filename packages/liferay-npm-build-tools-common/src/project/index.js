/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import path from 'path';
import readJsonSync from 'read-json-sync';

import Jar from './jar';
import Localization from './localization';

/**
 * Describes an standard JS Toolkit project.
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

		this.jar = new Jar(this);
		this.l10n = new Localization(this);
	}
}

export default new Project('.');
