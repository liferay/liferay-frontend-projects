/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import fs from 'fs';

import FilePath from '../file-path';
import {splitModuleName} from '../modules';
import PkgDesc from '../pkg-desc';
import {Project} from '.';
import {BundlerPluginDescriptor} from './types.d';

/**
 *
 * @param project
 * @param featuresKey
 * @param defaultPrjRelPosixPath a posix path relative to project root
 * @return absolute path to features file
 */
export function getFeaturesFilePath(
	project: Project,
	featuresKeyPath: string,
	defaultPrjRelPosixPath: string
): string | undefined {
	const {_npmbundlerrc, _projectDir} = project;

	const prjRelPosixPath = prop.get(_npmbundlerrc, featuresKeyPath);

	if (prjRelPosixPath !== undefined) {
		return _projectDir.join(new FilePath(prjRelPosixPath, {posix: true}))
			.asNative;
	}

	const defaultAbsPath = _projectDir.join(
		new FilePath(defaultPrjRelPosixPath, {posix: true})
	).asNative;

	if (fs.existsSync(defaultAbsPath)) {
		return defaultAbsPath;
	}

	return undefined;
}

/**
 * Get a configuration for a specific package. This method looks in the packages
 * section, then at root in the precedence order: first package id, then package
 * name.
 *
 * @remarks
 * Returns different types depending on `section`
 *
 * @param project
 * @param pkg the package descriptor
 * @param section the section name (like 'plugins', '.babelrc', ...)
 * @param defaultValue default value if not configured
 */
export function getPackageConfig(
	project: Project,
	pkg: PkgDesc,
	section: 'copy-plugins' | 'plugins' | '.babelrc' | 'post-plugins',
	defaultValue: object = undefined
): object {
	let pkgConfig: object;

	const {_npmbundlerrc} = project;

	if (
		_npmbundlerrc['packages'] &&
		_npmbundlerrc['packages'][pkg.id] &&
		_npmbundlerrc['packages'][pkg.id][section]
	) {
		pkgConfig = _npmbundlerrc['packages'][pkg.id][section];
	} else if (
		_npmbundlerrc['packages'] &&
		_npmbundlerrc['packages'][pkg.name] &&
		_npmbundlerrc['packages'][pkg.name][section]
	) {
		pkgConfig = _npmbundlerrc['packages'][pkg.name][section];
	} else if (
		_npmbundlerrc['packages'] &&
		_npmbundlerrc['packages']['*'] &&
		_npmbundlerrc['packages']['*'][section]
	) {
		pkgConfig = _npmbundlerrc['packages']['*'][section];
	}

	// Legacy configuration support
	else if (_npmbundlerrc[pkg.id] && _npmbundlerrc[pkg.id][section]) {
		pkgConfig = _npmbundlerrc[pkg.id][section];
	} else if (_npmbundlerrc[pkg.name] && _npmbundlerrc[pkg.name][section]) {
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
 * @param project
 * @param pkgConfig plugins configuration as extracted from .npmbundlerrc
 */
export function createBundlerPluginDescriptors(
	project: Project,
	pkgConfig: (object | string)[]
): BundlerPluginDescriptor[] {
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
		let pluginModule = project.toolRequire(
			parts.modulePath
				? pluginName
				: `liferay-npm-bundler-plugin-${pluginName}`
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
