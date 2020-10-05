/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import path from 'path';

import {BundlerTransformPluginState} from '../api/plugins';
import {splitModuleName} from '../modules';
import PkgDesc from '../pkg-desc';
import {Project} from '.';
import {BundlerPluginDescriptor, VersionInfo} from './types';
import * as util from './util';

/**
 * Defines configuration for the transform step.
 */
export default class Transform {
	constructor(project: Project) {
		this._project = project;
	}

	/**
	 * Get paths of files to be left untouched by babel
	 * @return array of output-relative globs (as defined by `globby`) to avoid
	 * 			when processing with Babel
	 */
	get babelIgnores(): string[] {
		const {npmbundlerrc} = this._project;

		return prop.get(npmbundlerrc, 'ignore', []);
	}

	/**
	 * Get all available information about versions of loaders used for the
	 * build.
	 * @return a Map where keys are package names
	 */
	get versionsInfo(): Map<string, VersionInfo> {
		// TODO: move copy plugin version info to its proper module
		if (this._versionsInfo === undefined) {
			const {_project} = this;
			const {npmbundlerrc} = _project;

			const map = new Map<string, VersionInfo>();

			let pluginNames: string[] = [];

			for (const key in npmbundlerrc) {
				pluginNames = this._concatAllPluginNames(
					pluginNames,
					npmbundlerrc[key]
				);
			}

			for (const key in npmbundlerrc['packages']) {
				pluginNames = this._concatAllPluginNames(
					pluginNames,
					npmbundlerrc['packages'][key]
				);
			}

			for (const pluginName of pluginNames) {
				if (!map.has(pluginName)) {
					const {pkgName, modulePath} = splitModuleName(pluginName);
					const pkgJsonPath = _project.toolResolve(
						`${pkgName}/package.json`
					);
					const pkgJson = _project.toolRequire(pkgJsonPath);

					map.set(pluginName, {
						version: pkgJson.version,
						path: path.relative(
							_project.dir.asNative,
							modulePath
								? _project.toolResolve(pluginName)
								: path.dirname(pkgJsonPath)
						),
					});
				}
			}

			this._versionsInfo = map;
		}

		return this._versionsInfo;
	}

	/**
	 * Get Babel config for a given package.
	 *
	 * @remarks
	 * Note that `presets` and `plugins` are returned as written in the
	 * configuration without any processing. If you want to get the plugins
	 * associated to a babel configuration you must call {@link getBabelPlugins}
	 * instead.
	 *
	 * @param pkg the package descriptor
	 * @return a Babel configuration object as defined by its API
	 */
	getBabelConfig(pkg: PkgDesc): object {
		const {_project} = this;

		return util.getPackageConfig(_project, pkg, '.babelrc', {});
	}

	/**
	 * Load Babel plugins from a given package's configuration
	 *
	 * @return an array of one item per plugin where the item is an array of a
	 *         function and an object with the options
	 */
	getBabelPlugins(pkg: PkgDesc): ([() => any, object])[] {
		const {_project} = this;

		const babelConfig = this.getBabelConfig(pkg);

		const presets = babelConfig['presets'] || [];
		const plugins = babelConfig['plugins'] || [];

		return []
			.concat(
				...presets.map(preset => {
					let presetModule;

					try {
						presetModule = _project.toolRequire(preset);
					} catch (err) {
						presetModule = _project.toolRequire(
							`babel-preset-${preset}`
						);
					}

					if (presetModule.default) {
						presetModule = presetModule.default;
					}

					return presetModule.plugins || presetModule().plugins;
				})
			)
			.concat(
				plugins.map(pluginConfig => {
					let pluginName;
					let pluginOptions;

					if (Array.isArray(pluginConfig)) {
						pluginName = pluginConfig[0];
						pluginOptions = pluginConfig[1];
					} else {
						pluginName = pluginConfig;
						pluginOptions = undefined;
					}

					let pluginModule;

					try {
						pluginModule = _project.toolRequire(pluginName);
					} catch (err) {
						pluginModule = _project.toolRequire(
							`babel-plugin-${pluginName}`
						);
					}

					if (pluginModule.default) {
						pluginModule = pluginModule.default;
					}

					return pluginOptions === undefined
						? pluginModule
						: [pluginModule, pluginOptions];
				})
			);
	}

	getPostPluginDescriptors(
		pkg: PkgDesc
	): BundlerPluginDescriptor<BundlerTransformPluginState>[] {
		const {_project} = this;

		const pkgConfig = util.getPackageConfig(
			_project,
			pkg,
			'post-plugins',
			[]
		) as [];

		return util.createBundlerPluginDescriptors(_project, pkgConfig);
	}

	getPrePluginDescriptors(
		pkg: PkgDesc
	): BundlerPluginDescriptor<BundlerTransformPluginState>[] {
		const {_project} = this;

		const pkgConfig = util.getPackageConfig(
			_project,
			pkg,
			'plugins',
			[]
		) as [];

		return util.createBundlerPluginDescriptors(_project, pkgConfig);
	}

	_concatAllPluginNames(pluginNames: string[], cfg: object) {
		if (cfg) {
			pluginNames = this._concatBundlerPluginNames(
				pluginNames,
				cfg['plugins']
			);

			pluginNames = this._concatBundlerPluginNames(
				pluginNames,
				cfg['post-plugins']
			);

			pluginNames = this._concatBabelPluginNames(
				pluginNames,
				cfg['.babelrc']
			);
		}

		return pluginNames;
	}

	_concatBabelPluginNames(pluginNames: string[], cfg: object[]) {
		if (!cfg) {
			return pluginNames;
		}

		const {_project} = this;

		const babelPresets = cfg['presets'];
		const babelPlugins = cfg['plugins'];

		if (babelPresets) {
			pluginNames = pluginNames.concat(
				babelPresets.map(name => {
					try {
						_project.toolRequire(name);
						return name;
					} catch (err) {
						return `babel-preset-${name}`;
					}
				})
			);
		}

		if (babelPlugins) {
			pluginNames = pluginNames.concat(
				babelPlugins.map(name => {
					if (Array.isArray(name)) {
						name = name[0];
					}

					try {
						_project.toolRequire(name);
						return name;
					} catch (err) {
						return `babel-plugin-${name}`;
					}
				})
			);
		}

		return pluginNames;
	}

	_concatBundlerPluginNames(pluginNames: string[], cfg: (string | [])[]) {
		if (!cfg) {
			return pluginNames;
		}

		return pluginNames.concat(
			cfg.map((name: any) => {
				if (Array.isArray(name)) {
					name = name[0];
				}

				if (splitModuleName(name)['modulePath']) {
					return name;
				} else {
					return `liferay-npm-bundler-plugin-${name}`;
				}
			})
		);
	}

	private readonly _project: Project;
	private _versionsInfo: Map<string, VersionInfo>;
}
