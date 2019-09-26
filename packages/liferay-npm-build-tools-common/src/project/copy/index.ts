/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {splitModuleName} from '../../modules';
import PkgDesc from '../../pkg-desc';
import {Project} from '..';
import {BundlerPluginDescriptor} from '../types';
import {BundlerCopyPluginDescriptor} from './types';

/**
 * Defines configuration for the copy step.
 */
export default class Copy {
	constructor(project: Project) {
		this._project = project;
	}

	/**
	 * Get the configured file exclusions for a given package.
	 * @param pkg the package descriptor
	 * @return an array of glob expressions (as defined by `globby`)
	 */
	getExclusions(pkg: PkgDesc): string[] {
		const {_npmbundlerrc} = this._project;

		let exclusions = _npmbundlerrc['exclude'] || {};

		// If it is explicitly false, return an empty exclusions array
		if (
			exclusions[pkg.id] === false ||
			exclusions[pkg.name] === false ||
			exclusions['*'] === false
		) {
			return [];
		}

		// If it is explicitly true, return an array with '**/*'
		if (
			exclusions[pkg.id] === true ||
			exclusions[pkg.name] === true ||
			exclusions['*'] === true
		) {
			return ['**/*'];
		}

		// In any other case, return what's in the config
		exclusions =
			exclusions[pkg.id] || exclusions[pkg.name] || exclusions['*'] || [];

		return exclusions;
	}

	getPluginDescriptors(pkg: PkgDesc): BundlerCopyPluginDescriptor[] {
		const pkgConfig = this._getPackageConfig(pkg, 'copy-plugins', []);

		return this._createBundlerPluginDescriptors(pkgConfig as []);
	}

	/**
	 * Get a configuration for a specific package. This method looks in the packages
	 * section, then at root in the precedence order: first package id, then package
	 * name.
	 *
	 * @remarks
	 * Returns different types depending on `section`
	 *
	 * @param pkg the package descriptor
	 * @param  section the section name (like 'plugins', '.babelrc', ...)
	 * @param  defaultValue default value if not configured
	 */
	_getPackageConfig(
		pkg: PkgDesc,
		section: 'copy-plugins' | 'plugins' | '.babelrc' | 'post-plugins',
		defaultValue: object = undefined
	): object {
		let pkgConfig: object;

		const {_npmbundlerrc} = this._project;

		if (
			_npmbundlerrc['packages'][pkg.id] &&
			_npmbundlerrc['packages'][pkg.id][section]
		) {
			pkgConfig = _npmbundlerrc['packages'][pkg.id][section];
		} else if (
			_npmbundlerrc['packages'][pkg.name] &&
			_npmbundlerrc['packages'][pkg.name][section]
		) {
			pkgConfig = _npmbundlerrc['packages'][pkg.name][section];
		} else if (
			_npmbundlerrc['packages']['*'] &&
			_npmbundlerrc['packages']['*'][section]
		) {
			pkgConfig = _npmbundlerrc['packages']['*'][section];
		}

		// Legacy configuration support
		else if (_npmbundlerrc[pkg.id] && _npmbundlerrc[pkg.id][section]) {
			pkgConfig = _npmbundlerrc[pkg.id][section];
		} else if (
			_npmbundlerrc[pkg.name] &&
			_npmbundlerrc[pkg.name][section]
		) {
			pkgConfig = _npmbundlerrc[pkg.name][section];
		} else if (_npmbundlerrc['*'] && _npmbundlerrc['*'][section]) {
			pkgConfig = _npmbundlerrc['*'][section];
		} else {
			pkgConfig = defaultValue;
		}

		return pkgConfig;
	}

	/**
	 * Instantiate bundler plugins described by their names.
	 * @param pkgConfig plugins configuration as extracted from .npmbundlerrc
	 */
	_createBundlerPluginDescriptors(
		pkgConfig: (object | string)[]
	): BundlerPluginDescriptor[] {
		const {_project} = this;

		return pkgConfig.map(pkgConfigItem => {
			let pluginName: string;
			let pluginConfig: object;

			if (Array.isArray(pkgConfigItem)) {
				pluginName = pkgConfigItem[0];
				pluginConfig = pkgConfigItem[1];
			} else {
				pluginName = pkgConfigItem as string;
				pluginConfig = {};
			}

			const parts = splitModuleName(pluginName);

			// If `pluginName` is a package prefix it with
			// `liferay-npm-bundler-plugin-`, otherwise use it directly
			let pluginModule = _project.toolRequire(
				parts.modulePath === ''
					? `liferay-npm-bundler-plugin-${pluginName}`
					: pluginName
			);

			if (pluginModule.default !== undefined) {
				pluginModule = pluginModule.default;
			}

			return {
				name: pluginName,
				config: pluginConfig,
				run: pluginModule,
			} as BundlerPluginDescriptor;
		});
	}

	_project: Project;
}
