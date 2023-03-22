/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import FilePath from '../../file/FilePath';
import LiferayJson from '../../schema/LiferayJson';
import Project from './Project';

export default class Dist {
	readonly dir: FilePath | null;
	readonly file: FilePath | null;

	constructor(project: Project, liferayJson: LiferayJson) {
		switch (liferayJson.build.type) {
			case 'bundler2': {
				const {
					default: bundler2Project,
					/* eslint-disable-next-line @typescript-eslint/no-var-requires */
				} = require('liferay-npm-build-tools-common/lib/project');

				this.dir = new FilePath(
					bundler2Project.jar.outputDir.asNative
				).resolve();
				this.file = this.dir.join(bundler2Project.jar.outputFilename);
				break;
			}

			case 'customElement':
			case 'themeSpritemap':
				this.dir = project.dir.join('dist');
				this.file = this.dir.join(`${project.dir.basename()}.zip`);
				break;

			default:
				throw new Error(
					`Unknown project build type type: ${liferayJson.build.type}`
				);
		}
	}
}
