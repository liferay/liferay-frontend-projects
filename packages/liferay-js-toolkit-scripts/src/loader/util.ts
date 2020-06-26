/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {FilePath} from 'liferay-js-toolkit-core';
import path from 'path';

import {project} from '../config';

const fileOriginCache: {[index: string]: FileOrigin} = {};
const packageDirCache: {[index: string]: FilePath} = {};

enum FileOrigin {
	SOURCE_PROJECT,
	SOURCE_DEPENDENCY,
	BUILD_PROJECT,
	BUILD_DEPENDENCY,
}

/**
 * Get the name of a module given its file path.
 *
 * @remarks
 * This method assumes that the module file lives in a liferay-npm-bundler
 * project. Otherwise, the return path may be incorrect.
 *
 * @param moduleFilePath the module file path
 * @return the name of the module
 */
export function getModuleName(moduleFilePath: string): string {
	const absModuleFilePosixPath = new FilePath(moduleFilePath).resolve()
		.asPosix;
	const absPkgPosixPath = new FilePath(getPackageDir(moduleFilePath)).asPosix;

	let moduleName: string = absModuleFilePosixPath.substring(
		absPkgPosixPath.length + 1
	);

	moduleName = moduleName.replace(/\.js$/i, '');

	if (getFileOrigin(moduleFilePath) === FileOrigin.SOURCE_PROJECT) {
		for (const source of project.sources) {
			const prefix = source.asPosix.substr(2);

			if (moduleName.startsWith(prefix)) {
				moduleName = moduleName.substring(prefix.length + 1);
				break;
			}
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-var-requires, liferay/no-dynamic-require,
	const pkgJson = require(getPackageJsonPath(moduleFilePath));

	return `${pkgJson.name}@${pkgJson.version}/${moduleName}`;
}

/**
 * Get the full path of the package directory for a given JS module file.
 *
 * @remarks
 * This method assumes that the module file lives in a liferay-npm-bundler
 * project. Otherwise, the return path may be incorrect.
 *
 * @param moduleFilePath the module file path
 * @return the full path to the package directory (with native path
 *         separators)
 */
export function getPackageDir(moduleFilePath: string): string {
	const absModuleFilePosixPath = new FilePath(moduleFilePath).resolve()
		.asPosix;

	let absPkgDir: FilePath = packageDirCache[absModuleFilePosixPath];

	if (absPkgDir) {
		return absPkgDir.asNative;
	}

	const fileOrigin = getFileOrigin(moduleFilePath);

	switch (fileOrigin) {
		case FileOrigin.SOURCE_DEPENDENCY: {
			const absModuleFilePosixPath = new FilePath(
				moduleFilePath
			).resolve().asPosix;

			const absNodeModulesPosixPath = project.dir.join('node_modules')
				.asPosix;

			const relModuleFilePosixPath = absModuleFilePosixPath.substring(
				absNodeModulesPosixPath.length + 1
			);

			const modulePathParts = relModuleFilePosixPath.split('/');

			const pkgDir = relModuleFilePosixPath.startsWith('@')
				? `${modulePathParts[0]}/${modulePathParts[1]}`
				: modulePathParts[0];

			absPkgDir = project.dir.join('node_modules', pkgDir);

			break;
		}

		case FileOrigin.BUILD_DEPENDENCY: {
			const absModuleFilePosixPath = new FilePath(
				moduleFilePath
			).resolve().asPosix;

			const absBuildNodeModulesPosixPath = project.dir.join(
				project.buildDir,
				'node_modules'
			).asPosix;

			const relBuildNodeModulesPosixPath = absModuleFilePosixPath.substring(
				absBuildNodeModulesPosixPath.length + 1
			);

			const modulePathParts = relBuildNodeModulesPosixPath.split('/');

			const pkgDir = modulePathParts[0];

			absPkgDir = project.dir.join(
				project.buildDir,
				'node_modules',
				pkgDir
			);

			break;
		}

		case FileOrigin.SOURCE_PROJECT: {
			absPkgDir = project.dir;

			break;
		}

		case FileOrigin.BUILD_PROJECT: {
			absPkgDir = project.dir.join(project.buildDir);

			break;
		}

		default:
			throw new Error(`Unkown FileOrigin: ${fileOrigin}`);
	}

	packageDirCache[absModuleFilePosixPath] = absPkgDir;

	return absPkgDir.asNative;
}

// TODO: get rid of this function once we support loading config from .js files
/**
 * Replace `${project.name}` and `${project.version}` tokens inside strings of
 * loader options objects.
 */
export function replaceTokens<T>(
	options: T,
	{except}: {except: string[]} = {except: []}
): T {
	const {pkgJson} = project;

	Object.keys(options).forEach((key) => {
		if (typeof options[key] === 'string') {
			if (except.includes(key)) {
				return;
			}

			options[key] = options[key]
				.replace(/\$\{project\.name\}/g, pkgJson['name'])
				.replace(/\$\{project\.version\}/g, pkgJson['version']);
		}
	});

	return options;
}

/**
 * Remove a webpack hash (a hex number surrounded by dots near the end of the
 * file name) if present from a file path.
 */
export function removeWebpackHash(filePath: string): string {
	const filePathParts = filePath.split('.');

	let hashIndex;

	for (hashIndex = filePathParts.length - 1; hashIndex >= 0; hashIndex--) {
		const filePathPart = filePathParts[hashIndex];

		if (filePathPart.match(/^[0-9a-fA-F]+$/)) {
			break;
		}
	}

	if (hashIndex === -1) {
		return filePath;
	}

	filePathParts.splice(hashIndex, 1);

	return filePathParts.join('.');
}

function getFileOrigin(filePath: string): FileOrigin {
	const absModuleFilePosixPath = new FilePath(filePath).resolve().asPosix;

	let fileOrigin: FileOrigin = fileOriginCache[absModuleFilePosixPath];

	if (fileOrigin) {
		return fileOrigin;
	}

	const absBuildNodeModulesPosixPath = project.dir.join(
		project.buildDir,
		'node_modules'
	).asPosix;
	const absBuildPosixPath = project.dir.join(project.buildDir).asPosix;
	const absNodeModulesPosixPath = project.dir.join('node_modules').asPosix;

	if (absModuleFilePosixPath.startsWith(absBuildNodeModulesPosixPath)) {
		fileOrigin = FileOrigin.BUILD_DEPENDENCY;
	} else if (absModuleFilePosixPath.startsWith(absBuildPosixPath)) {
		fileOrigin = FileOrigin.BUILD_PROJECT;
	} else if (absModuleFilePosixPath.startsWith(absNodeModulesPosixPath)) {
		fileOrigin = FileOrigin.SOURCE_DEPENDENCY;
	} else {
		fileOrigin = FileOrigin.SOURCE_PROJECT;
	}

	fileOriginCache[absModuleFilePosixPath] = fileOrigin;

	return fileOrigin;
}

function getPackageJsonPath(moduleFilePath: string): string {
	return path.join(getPackageDir(moduleFilePath), 'package.json');
}
