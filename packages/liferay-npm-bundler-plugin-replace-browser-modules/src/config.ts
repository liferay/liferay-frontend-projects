/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import {
	AliasHash,
	getAliasFields,
	loadAliases,
} from 'liferay-npm-build-tools-common/lib/alias';
import {BundlerPluginParams} from 'liferay-npm-build-tools-common/lib/api/plugins';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';

/** Index is the absolute POSIX path to aliasing folders */
export interface AliasesMap {
	[index: string]: AliasHash;
}

export function readAliases(
	params: BundlerPluginParams,
	absDir: FilePath
): AliasesMap {
	const {config, globalConfig} = params;

	const aliasFields = getAliasFields(globalConfig, config);

	return readAliasesFromDir(absDir, aliasFields);
}

/**
 * Recursively read all aliases in a folder and its descendants and store them
 * in an AliasesMap.
 *
 * @param absDir root search dir
 * @param aliasFields configured alias fields
 */
function readAliasesFromDir(
	absDir: FilePath,
	aliasFields: string[]
): AliasesMap {
	const aliasesMap: AliasesMap = {};

	aliasesMap[absDir.asPosix] = loadAliases(
		absDir.join('package.json'),
		aliasFields
	);

	fs.readdirSync(absDir.asNative)
		.filter(child => fs.statSync(absDir.join(child).asNative).isDirectory())
		.forEach(childDir => {
			Object.assign(
				aliasesMap,
				readAliasesFromDir(absDir.join(childDir), aliasFields)
			);
		});

	return aliasesMap;
}
