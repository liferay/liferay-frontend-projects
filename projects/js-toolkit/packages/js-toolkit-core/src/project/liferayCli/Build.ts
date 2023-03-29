/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs';

import FilePath from '../../file/FilePath';
import LiferayJson, {
	Bundler2BuildConfig,
	CustomElementBuildConfig,
	FDSCellRendererBuildConfig,
	ThemeSpritemapBuildConfig,
} from '../../schema/LiferayJson';
import Project from './Project';
import persist, {Location} from './persist';

type BuildType =
	| 'bundler2'
	| 'customElement'
	| 'fdsCellRenderer'
	| 'themeSpritemap';

type BuildOptions =
	| Bundler2BuildOptions
	| CustomElementBuildOptions
	| FDSCellRendererBuildOptions
	| ThemeSpritemapBuildOptions;

export type Bundler2BuildOptions = MinifiableBuildOptions;

export interface CustomElementBuildOptions extends WebpackBuildOptions {
	htmlElementName: string | null;
	portletCategoryName: string;
}

export type FDSCellRendererBuildOptions = WebpackBuildOptions;

export interface ThemeSpritemapBuildOptions {
	enableSVG4Everybody: boolean;
	extendClay: boolean;
}

export interface MinifiableBuildOptions {
	minify: boolean;
}

export interface WebpackBuildOptions extends MinifiableBuildOptions {
	externals: {[bareIdentifier: string]: string};
}

type OptionValue = boolean | number | string;

export default class Build {
	readonly dir: FilePath;
	readonly type: BuildType;
	readonly options: BuildOptions;

	constructor(project: Project, liferayJson: LiferayJson) {
		this._project = project;

		switch (liferayJson.build.type) {
			case 'customElement':
				this.type = 'customElement';
				this.dir = project.dir.join('build');
				this.options = this._toCustomElementBuildOptions(
					project,
					liferayJson.build?.options
				);
				break;

			case 'fdsCellRenderer':
				this.type = 'fdsCellRenderer';
				this.dir = project.dir.join('build');
				this.options = this._toFDSCellRendererBuildOptions(
					liferayJson.build?.options
				);
				break;

			case 'themeSpritemap':
				this.type = 'themeSpritemap';
				this.dir = project.dir.join('build');
				this.options = this._toThemeSpriteMapBuildOptions(
					liferayJson.build?.options
				);
				break;

			case 'bundler2': {
				const {
					default: bundler2Project,
					/* eslint-disable-next-line @typescript-eslint/no-var-requires */
				} = require('liferay-npm-build-tools-common/lib/project');

				this.type = 'bundler2';
				this.dir = new FilePath(
					bundler2Project.buildDir.asNative
				).resolve();
				this.options = this._toBundler2BuildOptions(
					liferayJson.build?.options
				);
				break;
			}

			default:
				throw new Error(
					`Unknown project build type type: ${
						(liferayJson.build as unknown)['type']
					}`
				);
		}
	}

	storeOption(name: string, value: OptionValue): void {
		let location: Location = 'user-project';

		// Validate options and decide location

		switch (this.type) {
			case 'bundler2':
				switch (name) {
					case 'minify':
						break;

					default:
						throw new Error(`Unknown option: ${name}`);
				}
				break;

			case 'customElement':
				switch (name) {
					case 'externals':
					case 'htmlElementName':
						location = 'project';
						break;

					case 'minify':
						break;

					default:
						throw new Error(`Unknown option: ${name}`);
				}
				break;

			default:
				throw new Error(`Unknown build type: ${this.type}`);
		}

		// Save the option

		this.options[name] = value;

		persist(this._project, 'build', `options.${name}`, {location});
	}

	private _toCustomElementBuildOptions(
		project: Project,
		config: CustomElementBuildConfig
	): CustomElementBuildOptions {

		// Infer htmlElementName from source code if needed

		if (!config.htmlElementName) {
			config.htmlElementName = findHtmlElementName(
				project.mainModuleFile
			);
		}

		if (!config.portletCategoryName) {
			config.portletCategoryName = 'category.remote-apps';
		}

		const webpackOptions = this._toWebpackBuildOptions(config);

		return {
			externals: webpackOptions.externals,
			htmlElementName: config.htmlElementName,
			minify: webpackOptions.minify,
			portletCategoryName: config.portletCategoryName,
		};
	}

	private _toFDSCellRendererBuildOptions(
		config: FDSCellRendererBuildConfig
	): FDSCellRendererBuildOptions {
		const webpackOptions = this._toWebpackBuildOptions(config);

		return {
			externals: webpackOptions.externals,
			minify: webpackOptions.minify,
		};
	}

	private _toThemeSpriteMapBuildOptions(
		config: ThemeSpritemapBuildConfig
	): ThemeSpritemapBuildOptions {
		return {
			enableSVG4Everybody: !!config.enableSVG4Everybody,
			extendClay: !!config.extendClay,
		};
	}

	private _toBundler2BuildOptions(
		_config: Bundler2BuildConfig
	): Bundler2BuildOptions {
		return {
			minify: process.env.NODE_ENV !== 'development',
		};
	}

	private _toWebpackBuildOptions(
		config: CustomElementBuildConfig | FDSCellRendererBuildConfig
	): WebpackBuildOptions {
		const options: WebpackBuildOptions = {
			externals: {},
			minify: process.env.NODE_ENV !== 'development',
		};

		// Turn arrays coming from liferay.json into objects

		if (Array.isArray(config.externals)) {
			options.externals = config.externals.reduce(
				(map, bareIdentifier) => {
					map[bareIdentifier] = bareIdentifier;

					return map;
				},
				{}
			);
		}
		else if (config.externals) {
			options.externals = config.externals;
		}

		// Remove externals mapped to null

		options.externals = Object.entries(options.externals).reduce(
			(externals, entry) => {
				if (entry[1] !== null) {
					externals[entry[0]] = entry[1];
				}

				return externals;
			},
			{}
		);

		return options;
	}

	private _project: Project;
}

function findHtmlElementName(file: FilePath): string | undefined {
	const source = fs.readFileSync(file.asNative, 'utf8');
	const regex = /customElements.define\(([^(]*)\)/;

	const match = regex.exec(source);

	if (!match) {
		return undefined;
	}

	const args = match[1].trim();

	if (!["'", '"'].includes(args[0])) {
		return undefined;
	}

	const quote = args[0];

	const i = args.indexOf(quote, 1);

	if (i < 0) {
		return undefined;
	}

	return args.substring(1, i);
}
