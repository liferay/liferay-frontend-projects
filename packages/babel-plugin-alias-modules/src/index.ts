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
let t;

/**
 * @return {object} a babel visitor
 */
export default function({types}) {
	t = types;

	return {
		visitor: {
			CallExpression(bpath, state) {
				state.visitor.CallExpression(bpath);
			},
			Program(bpath, state) {
				new Visitor(state);
			},
		},
	};
}

export class Visitor {
	constructor(state) {
		const babelIpcObject: BabelIpcObject = babelIpc.get(state, {});

		this._aliasFields = getAliasFields(
			babelIpcObject.globalConfig,
			state.opts
		);
		this._absFile = new FilePath(state.file.opts.filename);
		this._log = babelIpcObject.log;

		this._absRootDir = new FilePath(
			this._absFile.asNative.startsWith(absBuildDirPath)
				? absBuildDirPath
				: absPrjDirPath
		);

		state.visitor = this;
	}

	CallExpression(bpath) {
		const {_log} = this;
		const {node} = bpath;
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

		const aliasedModuleName = this._resolve(moduleName);

		if (aliasedModuleName === false) {
			bpath.replaceWith(t.objectExpression([]));

			_log.info(
				'alias-modules',
				`Replaced require('${moduleName}') with {}`
			).linkToCode(5);
		} else if (aliasedModuleName !== argument.value) {
			argument.value = aliasedModuleName;

			_log.info(
				'alias-modules',
				`Redirected '${moduleName}' to ` + `'${aliasedModuleName}'`
			).linkToCode(6);
		}
	}

	/**
	 * Get required module name as it should be required from `absFile` or `false`
	 * if it should be ignored.
	 *
	 * @param requiredModuleName
	 */
	_resolve(requiredModuleName: string): AliasToValue {
		const {_absRootDir, _absFile, _aliasFields, _log} = this;

		// Fail for absolute path modules
		if (requiredModuleName.startsWith('/')) {
			_log.error(
				'babel-plugin-alias-modules',
				`Require to absolute path ${requiredModuleName} will not work in ` +
					`AMD environments (like Liferay)`
			);

			return undefined;
		}

		const absFileDir = _absFile.dirname();
		const requiredModule = new FilePath(requiredModuleName, {posix: true});

		let alias;

		if (mod.isLocalModule(requiredModuleName)) {
			// First look in file directory (without recursion)
			alias = this._getAliasForLocal(
				absFileDir,
				absFileDir,
				requiredModule
			);

			// Then, if not found, recursively from target module up
			if (alias === undefined) {
				const moduleDir = absFileDir.join(requiredModule.dirname());
				const moduleBasename = requiredModule.basename();

				alias = this._getAliasForLocal(
					_absRootDir,
					moduleDir,
					moduleBasename
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
			alias = this._getAliasForExternal(absFileDir, requiredModule);
		}

		return alias === undefined ? requiredModuleName : alias;
	}

	/**
	 * Get resolved module name as it should be required from `absSearchDir` or
	 * `undefined` if it is not aliased.
	 *
	 * @param searchRelModuleName (without leading `./`)
	 */
	private _getAliasForLocal(
		absSearchTopDir: FilePath,
		absSearchDir: FilePath,
		searchRelModuleName: FilePath
	): AliasToValue | undefined {
		const {_aliasFields} = this;

		const aliases = loadAliases(
			absSearchDir.join('package.json'),
			_aliasFields
		);
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
		if (absSearchDir.is(absSearchTopDir)) {
			return undefined;
		}

		// Look up in hierachy
		alias = this._getAliasForLocal(
			absSearchTopDir,
			absSearchDir.dirname(),
			absSearchDir.basename().join(searchRelModuleName)
		);

		// Rebase to current folder
		if (
			alias !== undefined &&
			getAliasToType(alias) === AliasToType.LOCAL
		) {
			alias = new FilePath(`../${alias}`, {posix: true}).normalize()
				.asPosix;
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
	private _getAliasForExternal(
		absSearchDir: FilePath,
		requiredModule: FilePath
	): AliasToValue | undefined {
		const {_absRootDir, _aliasFields} = this;

		const aliases = loadAliases(
			absSearchDir.join('package.json'),
			_aliasFields
		);

		let alias = aliases[requiredModule.asPosix];

		// Found: return it
		if (alias !== undefined) {
			return alias;
		}

		// Search finished
		if (absSearchDir.is(_absRootDir)) {
			return undefined;
		}

		// Look up in hierachy
		alias = this._getAliasForExternal(
			absSearchDir.dirname(),
			requiredModule
		);

		// Rebase to current folder
		if (
			alias !== undefined &&
			getAliasToType(alias) === AliasToType.LOCAL
		) {
			alias = new FilePath(`../${alias}`, {posix: true}).normalize()
				.asPosix;
		}

		return alias;
	}

	private readonly _absRootDir: FilePath;
	private readonly _aliasFields: string[];
	private readonly _absFile: FilePath;
	private readonly _log: PluginLogger;
}
