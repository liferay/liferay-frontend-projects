/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import fs from 'fs-extra';
import FilePath, {AnyPath} from 'liferay-npm-build-tools-common/lib/file-path';
import {
	AliasFromType,
	AliasToValue,
	getAliasFromType,
} from 'liferay-npm-build-tools-common/lib/alias';

import {AliasesMap} from './config';

export interface UnrolledAliasesMap {
	/** Index is an absolute POSIX file path */
	[index: string]: UnrolledAlias[];
}

export interface UnrolledAlias {
	/** Absolute path to directory where alias is configured */
	absDir: FilePath;

	fromType: AliasFromType;

	/** Original 'from' field value */
	from: string;

	to: AliasToValue;
}

export function moduleExists(absFilePath: AnyPath) {
	try {
		return fs.statSync(absFilePath.toString()).isFile();
	} catch (err) {
		if (err.code === 'ENOENT') {
			return false;
		}

		throw err;
	}
}

export function unrollAliasesMap(aliasesMap: AliasesMap): UnrolledAliasesMap {
	const unrolledAliasesMap = {} as UnrolledAliasesMap;

	Object.entries(aliasesMap).forEach(([absDirPosixPath, aliasHash]) => {
		const absDir = new FilePath(absDirPosixPath, {posix: true});

		Object.entries(aliasHash).forEach(([from, to]) => {
			let absFrom = absDir.join(new FilePath(from, {posix: true}));

			if (!absFrom.asNative.toLowerCase().endsWith('.js')) {
				absFrom = new FilePath(`${absFrom.asNative}.js`);
			}

			unrolledAliasesMap[absFrom.asPosix] =
				unrolledAliasesMap[absFrom.asPosix] || [];

			unrolledAliasesMap[absFrom.asPosix].push({
				absDir,
				to,
				fromType: getAliasFromType(from),
				from,
			});
		});
	});

	return unrolledAliasesMap;
}
