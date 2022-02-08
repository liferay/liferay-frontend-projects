/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';

import FilePath from '../../file/FilePath';
import LiferayJson from '../../schema/LiferayJson';
import Project from './Project';

export default class Deploy {
	readonly dir: FilePath | null;

	constructor(project: Project, liferayJson: LiferayJson) {
		this._project = project;

		if (
			liferayJson.deploy === undefined ||
			liferayJson.deploy.path === undefined
		) {
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

		const file = this._project.dir.join('.liferay.json');

		const liferayJson = JSON.parse(
			fs.readFileSync(file.asNative, 'utf8')
		) as LiferayJson;

		liferayJson.deploy = liferayJson.deploy || {};
		liferayJson.deploy.path = this.dir.asPosix;

		fs.writeFileSync(
			file.asNative,
			JSON.stringify(liferayJson, null, '\t'),
			'utf8'
		);
	}

	private _project: Project;
}
