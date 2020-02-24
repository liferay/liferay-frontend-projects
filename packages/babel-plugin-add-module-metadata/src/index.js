/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as babelIpc from 'liferay-npm-build-tools-common/lib/babel-ipc';
import * as babelUtil from 'liferay-npm-build-tools-common/lib/babel-util';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import PluginLogger from 'liferay-npm-build-tools-common/lib/plugin-logger';
import npath from 'path';
import readJsonSync from 'read-json-sync';

/**
 * @return {object} a babel visitor
 */
export default function({types: t}) {
	return {
		visitor: {
			Identifier: {
				exit(path, state) {
					maybeAddEsModuleFlagCase2(t, path, state);
				},
			},
			StringLiteral: {
				exit(path, state) {
					maybeAddEsModuleFlagCase1(t, path, state);
				},
			},
		},
	};
}

/**
 * Add `esModule` flag when `__esModule` is being assigned true through
 * `Object.defineProperty()`.
 * @param {object} t
 * @param {object} path
 * @param {object} state
 * @return {boolean} true if `esModule` flag has been added
 */
function maybeAddEsModuleFlagCase1(t, path, state) {
	const {node} = path;

	if (node.value !== '__esModule') {
		return false;
	}

	const {parent} = path;

	if (!t.isCallExpression(parent)) {
		return false;
	}

	const {callee} = parent;

	if (
		!t.isMemberExpression(callee) ||
		!t.isIdentifier(callee.object) ||
		callee.object.name !== 'Object' ||
		!t.isIdentifier(callee.property) ||
		callee.property.name !== 'defineProperty'
	) {
		return false;
	}

	const args = parent.arguments;

	if (args.length != 3) {
		return false;
	}

	if (
		!t.isIdentifier(args[0]) ||
		args[0].name !== 'exports' ||
		!t.isStringLiteral(args[1]) ||
		args[1].value !== '__esModule' ||
		!t.isObjectExpression(args[2])
	) {
		return false;
	}

	addEsModuleFlag(state);

	return true;
}

/**
 * Add `esModule` flag when `__esModule` is being assigned true through
 * `module.exports` or `exports`.
 * @param {object} t
 * @param {object} path
 * @param {object} state
 * @return {boolean} true if `esModule` flag has been added
 */
function maybeAddEsModuleFlagCase2(t, path, state) {
	const {node} = path;

	if (node.name !== '__esModule') {
		return false;
	}

	const {parent} = path;

	if (!t.isMemberExpression(parent) || !parent.object === 'exports') {
		return false;
	}

	addEsModuleFlag(state);

	return true;
}

/**
 * Add `esModule` flag to current JS module.
 * @param {object} state
 */
function addEsModuleFlag(state) {
	if (state.esModuleFlagAdded) {
		return;
	}

	const {filename} = state.file.opts;
	const pkgDir = babelUtil.getPackageDir(filename);
	const pkgJson = readJsonSync(npath.join(pkgDir, 'package.json'));

	const {rootPkgJson} = babelIpc.get(state);

	const pkgId =
		pkgJson.name === rootPkgJson.name
			? '/'
			: `${pkgJson.name}@${pkgJson.version}`;

	const {manifest} = babelIpc.get(state);

	manifest.addModuleFlags(
		pkgId,
		new FilePath(npath.relative(pkgDir, filename)).asPosix,
		{
			esModule: true,
		}
	);

	state.esModuleFlagAdded = true;

	const {log} = babelIpc.get(state, () => ({
		log: new PluginLogger(),
	}));

	log.info('add-module-metadata', "Added 'esModule' flag");
}
