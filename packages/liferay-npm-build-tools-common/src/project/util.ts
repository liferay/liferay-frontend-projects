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
import {BundlerPluginDescriptor} from './types';

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
	const {npmbundlerrc, dir: projectDir} = project;

	const prjRelPosixPath: string = prop.get(npmbundlerrc, featuresKeyPath);

	if (prjRelPosixPath !== undefined) {
		return projectDir.join(new FilePath(prjRelPosixPath, {posix: true}))
			.asNative;
	}

	const defaultAbsPath = projectDir.join(
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

	const {npmbundlerrc} = project;

	if (
		npmbundlerrc['packages'] &&
		npmbundlerrc['packages'][pkg.id] &&
		npmbundlerrc['packages'][pkg.id][section]
	) {
		pkgConfig = npmbundlerrc['packages'][pkg.id][section];
	} else if (
		npmbundlerrc['packages'] &&
		npmbundlerrc['packages'][pkg.name] &&
		npmbundlerrc['packages'][pkg.name][section]
	) {
		pkgConfig = npmbundlerrc['packages'][pkg.name][section];
	} else if (
		npmbundlerrc['packages'] &&
		npmbundlerrc['packages']['*'] &&
		npmbundlerrc['packages']['*'][section]
	) {
		pkgConfig = npmbundlerrc['packages']['*'][section];
	}

	// Legacy configuration support
	else if (npmbundlerrc[pkg.id] && npmbundlerrc[pkg.id][section]) {
		pkgConfig = npmbundlerrc[pkg.id][section];
	} else if (npmbundlerrc[pkg.name] && npmbundlerrc[pkg.name][section]) {
		pkgConfig = npmbundlerrc[pkg.name][section];
	} else if (npmbundlerrc['*'] && npmbundlerrc['*'][section]) {
		pkgConfig = npmbundlerrc['*'][section];
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
export function createBundlerPluginDescriptors<T>(
	project: Project,
	pkgConfig: (object | string)[]
): BundlerPluginDescriptor<T>[] {
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
		} as BundlerPluginDescriptor<T>;
	});
}
