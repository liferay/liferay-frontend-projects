/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import {
	AliasFromType,
	AliasToType,
	getAliasToType,
} from 'liferay-npm-build-tools-common/lib/alias';
import {
	BundlerPluginParams,
	BundlerTransformPluginState,
} from 'liferay-npm-build-tools-common/lib/api/plugins';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import project from 'liferay-npm-build-tools-common/lib/project';

import {readAliases} from './config';
import {UnrolledAliasesMap, moduleExists, unrollAliasesMap} from './util';

/**
 * Plugin entry point
 */
export default function(
	params: BundlerPluginParams,
	{}: BundlerTransformPluginState
): void {
	const {log, pkg} = params;

	const absRootDir = project.dir.join(pkg.dir);

	const aliasesMap = readAliases(params, absRootDir);

	const unrolledAliasesMap = unrollAliasesMap(aliasesMap);

	reportAndResolveCollisions(log, absRootDir, unrolledAliasesMap);

	processAliases(log, absRootDir, unrolledAliasesMap);
}

/**
 *
 * @param log
 * @param absRootDir
 * @param unrolledAliasesMap should be filtered so that there's only one alias
 *        per entry.
 */
function processAliases(
	log: PluginLogger,
	absRootDir: FilePath,
	unrolledAliasesMap: UnrolledAliasesMap
) {
	Object.entries(unrolledAliasesMap).forEach(
		([absFromPath, unrolledAliases]) => {
			// Sanity check
			if (unrolledAliases.length > 1) {
				throw new Error(
					'Unrolled aliases map has unresolved collisions'
				);
			}

			const alias = unrolledAliases[0];

			const absFromFile = new FilePath(absFromPath);
			const rootRelAbsDirPosixPath = absRootDir.relative(alias.absDir)
				.asPosix;

			const rootRelFilePosixPath = absRootDir.relative(absFromFile)
				.asPosix;

			switch (getAliasToType(alias.to)) {
				case AliasToType.IGNORE: {
					rewriteFile(
						absFromFile,
						`/* ignored by alias field(s) configured in ${rootRelAbsDirPosixPath} */`
					);

					log.info(
						'replace-browser-modules',
						`Emptied file '${rootRelFilePosixPath}' as ` +
							`configured in '${rootRelAbsDirPosixPath}'`
					).linkToCode(1);
					break;
				}

				case AliasToType.EXTERNAL: {
					rewriteFile(
						absFromFile,
						`/* redirected by alias field(s) in ${rootRelAbsDirPosixPath} */`,
						`module.exports = require('${alias.to}');`
					);

					log.info(
						'replace-browser-modules',
						`Redirected file '${rootRelFilePosixPath}' to ` +
							`'${alias.to}' as configured in ` +
							`'${rootRelAbsDirPosixPath}'`
					).linkToCode(2);
					break;
				}

				case AliasToType.LOCAL: {
					const absToFile = alias.absDir.join(
						new FilePath(alias.to as string, {posix: true})
					);
					const fromRelToFile = absFromFile
						.dirname()
						.relative(absToFile);

					rewriteFile(
						absFromFile,
						`/* redirected by alias field(s) in ${rootRelAbsDirPosixPath} */`,
						`module.exports = require('./${fromRelToFile.asPosix}');`
					);

					log.info(
						'replace-browser-modules',
						`Redirected file '${rootRelFilePosixPath}' to ` +
							`'./${fromRelToFile.asPosix}' as configured in ` +
							`'${rootRelAbsDirPosixPath}'`
					).linkToCode(2);
					break;
				}
			}
		}
	);
}

export function reportAndResolveCollisions(
	log: PluginLogger,
	absRootDir: FilePath,
	unrolledAliasesMap: UnrolledAliasesMap
): void {
	// Remove aliases out of ancestry line
	Object.keys(unrolledAliasesMap).forEach(absFromPosixPath => {
		unrolledAliasesMap[absFromPosixPath] = unrolledAliasesMap[
			absFromPosixPath
		].filter(alias => {
			const included = absFromPosixPath.startsWith(alias.absDir.asPosix);

			// No need to log anything because this type of alias must be
			// addressed by rewriting requires, not by module rewrite

			return included;
		});
	});

	// Remove aliases of external modules that would overwrite a local one
	Object.keys(unrolledAliasesMap).forEach(absFromPosixPath => {
		unrolledAliasesMap[absFromPosixPath] = unrolledAliasesMap[
			absFromPosixPath
		].filter(alias => {
			const included =
				alias.fromType != AliasFromType.EXTERNAL ||
				!moduleExists(absFromPosixPath);

			if (!included) {
				const rootRelDir = absRootDir.relative(alias.absDir);
				const where =
					rootRelDir.asPosix == ''
						? "project's root folder"
						: `'${rootRelDir.asPosix}'`;

				log.warn(
					'replace-browser-modules',
					`Alias '${alias.from}' configured in ${where} will not ` +
						`be visible from outside because a local module with ` +
						`the same name exists`
				).linkToCode(3);
			}

			return included;
		});
	});

	// Remove empty aliases
	Object.keys(unrolledAliasesMap).forEach(absFromPath => {
		if (unrolledAliasesMap[absFromPath].length == 0) {
			delete unrolledAliasesMap[absFromPath];
		}
	});

	// Resolve collisions in multiple length aliases
	Object.entries(unrolledAliasesMap)
		.filter(([absFromPath, unrolledAliases]) => unrolledAliases.length > 1)
		.forEach(([absFromPath, unrolledAliases]) => {
			// Sort by distance to absFromPath
			unrolledAliases.sort(
				(a, b) => a.absDir.asPosix.length - b.absDir.asPosix.length
			);

			// we always use the last
			unrolledAliases.splice(0, unrolledAliases.length - 1);

			const alias = unrolledAliases[0];
			const rootRelFromPosixPath = absRootDir.relative(absFromPath)
				.asPosix;

			const rootRelDir = absRootDir.relative(alias.absDir);
			const where =
				rootRelDir.asPosix == ''
					? "project's root folder"
					: `'${rootRelDir.asPosix}'`;

			log.warn(
				'replace-browser-modules',
				`File '${rootRelFromPosixPath}' is aliased more than once, ` +
					`only the alias configured in ${where} will be visible ` +
					`when required from outside`
			).linkToCode(4);
		});
}

function rewriteFile(absFile: FilePath, ...lines: string[]) {
	fs.ensureDirSync(absFile.dirname().asNative);
	fs.writeFileSync(absFile.asNative, lines.join('\n'));
}
