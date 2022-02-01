/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import FilePath from '../../file/FilePath';
import {
	BuildConfig,
	Bundler2BuildConfig,
	CustomElementBuildConfig,
} from '../../schema/LiferayJson';
import Project from './Project';

type BuildType = 'bundler2' | 'customElement';

type BuildOptions = Bundler2BuildOptions | CustomElementBuildOptions;

export type Bundler2BuildOptions = {};

export interface CustomElementBuildOptions {
	externals: {[bareIdentifier: string]: string};
	htmlElementName: string | null;
}

export default class Build {
	readonly dir: FilePath;
	readonly type: BuildType;
	readonly options: BuildOptions;

	constructor(project: Project) {
		const {liferayJson} = project;

		const config: BuildConfig = liferayJson.build?.options || {};

		switch (liferayJson.build.type) {
			case 'customElement':
				this.type = 'customElement';
				this.dir = project.dir.join('build');
				this.options = this._toCustomElementBuildOptions(
					config as CustomElementBuildConfig
				);
				break;

			case 'bundler2':
			default: {
				/* eslint-disable-next-line @typescript-eslint/no-var-requires */
				const bundler2Project = require('liferay-npm-build-tools-common/lib/project');

				this.type = 'bundler2';
				this.dir = new FilePath(
					bundler2Project.buildDir.asNative
				).resolve();
				this.options = this._toBundler2BuildOptions(
					config as Bundler2BuildConfig
				);
				break;
			}
		}
	}

	private _toCustomElementBuildOptions(
		config: CustomElementBuildConfig
	): CustomElementBuildOptions {
		const options: CustomElementBuildOptions = {
			externals: {},
			htmlElementName: null,
		};

		if (Array.isArray(config['externals'])) {
			options.externals = config.externals.reduce(
				(map, bareIdentifier) => {
					map[bareIdentifier] = bareIdentifier;

					return map;
				},
				{}
			);
		}

		return options;
	}

	private _toBundler2BuildOptions(
		_config: Bundler2BuildConfig
	): Bundler2BuildOptions {
		return {};
	}
}
