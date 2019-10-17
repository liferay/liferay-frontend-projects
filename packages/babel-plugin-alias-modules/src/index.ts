/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
	AliasToValue,
	getAliasFields,
	getAliasToType,
	loadAliases,
	AliasToType,
} from 'liferay-npm-build-tools-common/lib/alias';
import {BabelIpcObject} from 'liferay-npm-build-tools-common/lib/api/plugins';
import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import * as mod from 'liferay-npm-build-tools-common/lib/modules';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import project from 'liferay-npm-build-tools-common/lib/project';

const absPrjDirPath = project.dir.asNative;
const absBuildDirPath = project.dir.join(project.buildDir).asNative;

/**
 * @return {object} a babel visitor
 */
export default function({types: t}) {
	return {
		visitor: {
			CallExpression(bpath, state) {
				const {node} = bpath;
				const {aliasFields} = state;
				const {filename}: {filename: string} = state.file.opts;
				const {log}: BabelIpcObject = babelIpc.get(state, () => ({
					log: new PluginLogger(),
				}));

				const {callee} = node;

				if (!t.isIdentifier(callee)) {
					return;
				}

				if (callee.name !== 'require') {
					return;
				}

				const argument = node.arguments[0];

				if (!t.isLiteral(argument) || !argument.value) {
					return;
				}

				const moduleName = argument.value;

				if (typeof moduleName !== 'string') {
					return;
				}

				const absRootDirPath = filename.startsWith(absBuildDirPath)
					? absBuildDirPath
					: absPrjDirPath;

				const aliasedModuleName = resolve(
					new FilePath(absRootDirPath),
					new FilePath(filename),
					moduleName,
					aliasFields,
					log
				);

				if (aliasedModuleName === false) {
					bpath.replaceWith(t.objectExpression([]));

					log.info(
						'alias-modules',
						`Replaced require('${moduleName}') with {}`
					).linkToCode(5);
				} else if (aliasedModuleName !== argument.value) {
					argument.value = aliasedModuleName;

					log.info(
						'alias-modules',
						`Redirected '${moduleName}' to ` +
							`'${aliasedModuleName}'`
					).linkToCode(6);
				}
			},
			Program(bpath, state) {
				const {opts} = state;
				const {globalConfig}: BabelIpcObject = babelIpc.get(state, {});

				state.aliasFields = getAliasFields(globalConfig, opts);
			},
		},
	};
}

/**
 * Get required module name as it should be required from `absFile` or `false`
 * if it should be ignored.
 *
 * @param absRootDir
 * @param absFile
 * @param requiredModuleName
 */
export function resolve(
	absRootDir: FilePath,
	absFile: FilePath,
	requiredModuleName: string,
	aliasFields: string[],
	log: PluginLogger
): AliasToValue {
	// Fail for absolute path modules
	if (requiredModuleName.startsWith('/')) {
		log.error(
			'babel-plugin-alias-modules',
			`Require to absolute path ${requiredModuleName} will not work in ` +
				`AMD environments (like Liferay)`
		);

		return undefined;
	}

	const absFileDir = absFile.dirname();
	const requiredModule = new FilePath(requiredModuleName, {posix: true});

	let alias;

	if (mod.isLocalModule(requiredModuleName)) {
		// First look in file directory (without recursion)
		alias = getAliasForLocal(
			absFileDir,
			absFileDir,
			requiredModule,
			aliasFields
		);

		// Then, if not found, recursively from target module up
		if (alias === undefined) {
			const moduleDir = absFileDir.join(requiredModule.dirname());
			const moduleBasename = requiredModule.basename();

			alias = getAliasForLocal(
				absRootDir,
				moduleDir,
				moduleBasename,
				aliasFields
			);

			if (
				alias !== undefined &&
				getAliasToType(alias) === AliasToType.LOCAL
			) {
				alias = absFileDir
					.relative(moduleDir)
					.join(new FilePath(alias, {posix: true})).asPosix;

				if (!alias.startsWith('.')) {
					alias = `./${alias}`;
				}
			}
		}
	} else {
		alias = getAliasForExternal(
			absRootDir,
			absFileDir,
			requiredModule,
			aliasFields
		);
	}

	return alias === undefined ? requiredModuleName : alias;
}

/**
 * Get resolved module name as it should be required from `absSearchDir` or
 * `undefined` if it is not aliased.
 *
 * @param absRootDir
 * @param absSearchDir
 * @param searchRelModuleName (without leading `./`)
 */
function getAliasForLocal(
	absRootDir: FilePath,
	absSearchDir: FilePath,
	searchRelModuleName: FilePath,
	aliasFields: string[]
): AliasToValue | undefined {
	const aliases = loadAliases(absSearchDir.join('package.json'), aliasFields);
	const normalizedSearchRelModuleName = `./${searchRelModuleName.asPosix}`;

	let alias = aliases[normalizedSearchRelModuleName];

	// Try with file alias
	if (
		alias === undefined &&
		!normalizedSearchRelModuleName.toLowerCase().endsWith('.js')
	) {
		alias = aliases[`${normalizedSearchRelModuleName}.js`];
	}

	// Try with external module aliases
	if (alias === undefined) {
		alias = aliases[searchRelModuleName.asPosix];
	}

	// Found: return it
	if (alias !== undefined) {
		return alias;
	}

	// Search finished
	if (absSearchDir.is(absRootDir)) {
		return undefined;
	}

	// Look up in hierachy
	alias = getAliasForLocal(
		absRootDir,
		absSearchDir.dirname(),
		absSearchDir.basename().join(searchRelModuleName),
		aliasFields
	);

	// Rebase to current folder
	if (alias !== undefined && getAliasToType(alias) === AliasToType.LOCAL) {
		alias = new FilePath(`../${alias}`, {posix: true}).normalize().asPosix;
	}

	return alias;
}

/**
 * Get resolved module name or `undefined` if it is not aliased.
 *
 * @param absRootDir
 * @param absSearchDir
 * @param searchRelModuleName
 */
function getAliasForExternal(
	absRootDir: FilePath,
	absSearchDir: FilePath,
	requiredModule: FilePath,
	aliasFields: string[]
): AliasToValue | undefined {
	const aliases = loadAliases(absSearchDir.join('package.json'), aliasFields);

	let alias = aliases[requiredModule.asPosix];

	// Found: return it
	if (alias !== undefined) {
		return alias;
	}

	// Search finished
	if (absSearchDir.is(absRootDir)) {
		return undefined;
	}

	// Look up in hierachy
	alias = getAliasForExternal(
		absRootDir,
		absSearchDir.dirname(),
		requiredModule,
		aliasFields
	);

	// Rebase to current folder
	if (alias !== undefined && getAliasToType(alias) === AliasToType.LOCAL) {
		alias = new FilePath(`../${alias}`, {posix: true}).normalize().asPosix;
	}

	return alias;
}
