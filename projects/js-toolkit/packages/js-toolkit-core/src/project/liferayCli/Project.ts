/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

import FilePath from '../../file/FilePath';
import LiferayJson from '../../schema/LiferayJson';
import PkgJson from '../../schema/PkgJson';
import Build from './Build';
import Deploy from './Deploy';
import Dist from './Dist';
import Start from './Start';

export default class Project {
	readonly assetsDir: FilePath | null;
	readonly build: Build;
	readonly deploy: Deploy;
	readonly dir: FilePath;
	readonly dist: Dist;
	readonly liferayJson: LiferayJson;
	readonly mainModuleFile: FilePath;
	readonly pkgJson: PkgJson;
	readonly srcDir: FilePath;
	readonly start: Start;

	constructor(projectPath: string) {
		this.dir = new FilePath(projectPath).resolve();
		this.assetsDir = this.dir.join('assets');
		this.srcDir = this.dir.join('src');

		if (!fs.existsSync(this.assetsDir.asNative)) {
			this.assetsDir = null;
		}

		this.pkgJson = JSON.parse(
			fs.readFileSync(this.dir.join('package.json').asNative, 'utf8')
		);

		if (this.pkgJson.main) {
			this.mainModuleFile = this.dir.join(
				new FilePath(this.pkgJson.main, {posix: true})
			);
		}
		else {
			this.mainModuleFile = this.srcDir.join('index.js');
		}

		this.liferayJson = this._loadLiferayJson();

		this.build = new Build(this);
		this.deploy = new Deploy(this);
		this.dist = new Dist(this);
		this.start = new Start(this);
	}

	private _loadLiferayJson(): LiferayJson {
		let liferayJson = {};

		[
			path.join(os.homedir(), '.liferay.json'),
			this.dir.join('.liferay.json').asNative,
			this.dir.join('liferay.json').asNative,
		].forEach((liferayJsonPath) => {
			try {
				liferayJson = {
					...liferayJson,
					...JSON.parse(fs.readFileSync(liferayJsonPath, 'utf8')),
				};
			}
			catch (error) {
				if (error.code !== 'ENOENT') {
					throw error;
				}
			}
		});

		return liferayJson as LiferayJson;
	}
}
