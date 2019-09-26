/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';

import PkgDesc from '../../pkg-desc';
import {Project} from '..';
import * as util from '../util';
import {BabelPlugin, BundlerTransformPluginDescriptor} from './types';

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
		const {_npmbundlerrc} = this._project;

		return prop.get(_npmbundlerrc, 'ignore', []);
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
	 */
	getBabelPlugins(pkg: PkgDesc): BabelPlugin[] {
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
				...plugins.map(plugin => {
					let pluginModule;

					try {
						pluginModule = _project.toolRequire(plugin);
					} catch (err) {
						pluginModule = _project.toolRequire(
							`babel-plugin-${plugin}`
						);
					}

					if (pluginModule.default) {
						pluginModule = pluginModule.default;
					}

					return pluginModule;
				})
			);
	}

	getPostPluginDescriptors(pkg: PkgDesc): BundlerTransformPluginDescriptor[] {
		const {_project} = this;

		const pkgConfig = util.getPackageConfig(
			_project,
			pkg,
			'post-plugins',
			[]
		) as [];

		return util.createBundlerPluginDescriptors(_project, pkgConfig);
	}

	getPrePluginDescriptors(pkg: PkgDesc): BundlerTransformPluginDescriptor[] {
		const {_project} = this;

		const pkgConfig = util.getPackageConfig(
			_project,
			pkg,
			'plugins',
			[]
		) as [];

		return util.createBundlerPluginDescriptors(_project, pkgConfig);
	}

	_project: Project;
}
