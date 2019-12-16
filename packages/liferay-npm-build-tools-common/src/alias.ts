/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import prop from 'dot-prop';
import readJsonSync from 'read-json-sync';

import FilePath from './file-path';

/** Alias configuration as expressed in `package.json` files */
export type AliasConfig = false | string | AliasHash | undefined;

/** Value of the right hand side of an alias */
export type AliasToValue = false | string;

export enum AliasFromType {
	EXTERNAL,
	LOCAL,
}

export enum AliasToType {
	IGNORE,
	EXTERNAL,
	LOCAL,
}

/**
 * Index is the `from` field of the alias (`/` normalized to `./`), value is the
 * `to` field.
 */
export interface AliasHash {
	[index: string]: AliasToValue;
}

const aliasesCache: { [index: string]: AliasHash } = Object.create(null);

/**
 * Get `resolve.aliasFields` configuration value.
 *
 * @remarks
 * The `resolve.aliasFields` name resembles the value webpack's configuration
 * uses for the same functionality (see
 * https://webpack.js.org/configuration/resolve/#resolvealiasfields)
 */
export function getAliasFields(globalConfig: object, config: object): string[] {
	let aliasFields: string[];

	if (prop.has(config, 'resolve.aliasFields')) {
		aliasFields = prop.get(config, 'resolve.aliasFields');
	} else if (prop.has(globalConfig, 'resolve.aliasFields')) {
		aliasFields = prop.get(globalConfig, 'resolve.aliasFields');
	} else {
		aliasFields = ['browser'];
	}

	return aliasFields;
}

/**
 * Get the type of an alias `from` field (left hand side of alias)
 */
export function getAliasFromType(from: string): AliasFromType {
	if (from.startsWith('/') || from.startsWith('.') || from.startsWith('..')) {
		return AliasFromType.LOCAL;
	}

	return AliasFromType.EXTERNAL;
}

/**
 * Get the type of an alias `to` field (right hand side of alias)
 */
export function getAliasToType(to: AliasToValue): AliasToType {
	if (to === false) {
		return AliasToType.IGNORE;
	}

	if (to.startsWith('/')) {
		throw new Error(
			`Absolute paths in require() calls are not supported: ${to}`
		);
	}

	if (to.startsWith('.') || to.startsWith('..')) {
		return AliasToType.LOCAL;
	}

	return AliasToType.EXTERNAL;
}

/**
 * Load aliases from a `package.json` file.
 */
export function loadAliases(
	pkgJsonFile: FilePath,
	aliasFields: string[]
): AliasHash {
	const absPkgJsonFile = pkgJsonFile.resolve();
	const cacheKey = `${absPkgJsonFile.asNative}|${aliasFields.join()}`;

	let aliases: AliasHash = aliasesCache[cacheKey];

	// If not yet cached proceed
	if (aliases === undefined) {
		const pkgJson = safeReadJsonSync(absPkgJsonFile);

		aliases = aliasFields.reduce(
			(aliases: AliasHash, aliasField: string) => {
				const aliasConfig: AliasConfig = pkgJson[aliasField];

				if (aliasConfig === undefined) {
					return aliases;
				}

				if (aliasConfig === false || typeof aliasConfig === 'string') {
					const main = pkgJson['main'] || './index.js';

					aliases[main] = aliasConfig;
				} else {
					Object.entries(aliasConfig).forEach(([from, to]) => {
						aliases[from] = to;
					});
				}

				return aliases;
			},
			{}
		);

		// Normalize `/` to `./`
		Object.keys(aliases).forEach(key => {
			if (key.startsWith('/')) {
				aliases[`.${key}`] = aliases[key];
				delete aliases[key];
			}
		});
	}

	// Store in cache
	aliasesCache[cacheKey] = Object.assign(Object.create(null), aliases);

	return aliases;
}

function safeReadJsonSync(pkgJsonFile: FilePath): object {
	try {
		return readJsonSync(pkgJsonFile.asNative);
	} catch (err) {
		if (err.code === 'ENOENT') {
			return {};
		}

		throw err;
	}
}
