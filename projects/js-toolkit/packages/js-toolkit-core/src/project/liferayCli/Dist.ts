/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import FilePath from '../../file/FilePath';
import Project from './Project';

export default class Dist {
	readonly dir: FilePath | null;
	readonly file: FilePath | null;

	constructor(project: Project) {
		const {liferayJson} = project;

		switch (liferayJson.build.type) {
			case 'customElement':
				this.dir = null;
				this.file = null;
				break;

			case 'bundler2':
			default: {
				/* eslint-disable-next-line @typescript-eslint/no-var-requires */
				const bundler2Project = require('liferay-npm-build-tools-common/lib/project');

				this.dir = new FilePath(
					bundler2Project.jar.outputDir.asNative
				).resolve();
				this.file = this.dir.join(bundler2Project.jar.outputFilename);
				break;
			}
		}
	}
}
