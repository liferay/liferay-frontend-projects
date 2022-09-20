/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import FilePath from '../../file/FilePath';
import LiferayJson from '../../schema/LiferayJson';
import Project from './Project';
import persist from './persist';

export default class Deploy {
	readonly dir: FilePath | null;

	constructor(project: Project, liferayJson: LiferayJson) {
		this._project = project;

		if (liferayJson.deploy?.path === undefined) {
			this.dir = null;
		}
		else {
			this.dir = new FilePath(liferayJson.deploy.path as string, {
				posix: true,
			}).resolve();
		}
	}

	storeDir(deployDir: FilePath): void {
		(this as object)['dir'] = deployDir.resolve();

		persist(this._project, 'deploy', 'dir', {configProperty: 'path'});
	}

	private _project: Project;
}
