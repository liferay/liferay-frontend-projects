/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import * as fs from 'fs';
import * as globby from 'globby';
import FilePath from 'liferay-npm-build-tools-common/lib/file-path';
import * as mod from 'liferay-npm-build-tools-common/lib/modules';
import * as ns from 'liferay-npm-build-tools-common/lib/namespace';
import readJsonSync from 'read-json-sync';
import resolve from 'resolve';

/**
 * @return {void}
 */
export default function({config, log, pkg, source}, {pkgJson}) {
	const defineCall = (config.defineCall || 'Liferay.Loader.define') + '(';

	pkgJson.dependencies = pkgJson.dependencies || {};

	const injectedDeps = {};
	const failedDeps = {};

	globby
		.sync([`${pkg.dir.asPosix}/**/*.js`])
		.map(posixPath => new FilePath(posixPath, {posix: true}))
		.forEach(file => {
			const code = fs.readFileSync(file.asNative);
			const defineCallOffset = code.indexOf(defineCall);

			if (defineCallOffset != -1) {
				const funOffset = code.indexOf(')', defineCallOffset);
				let defineCallLine;

				if (code instanceof Buffer) {
					defineCallLine = code.toString(
						'utf8',
						defineCallOffset + defineCall.length,
						funOffset
					);
				} else {
					defineCallLine = code.substring(
						defineCallOffset + defineCall.length,
						funOffset
					);
				}
				defineCallLine = defineCallLine.replace(/\n/g, ' ');

				defineCallLine = removeModuleName(defineCallLine);

				defineCallLine = defineCallLine.trim();

				const deps = extractDependencies(defineCallLine);

				processModuleDependencies(
					pkgJson,
					deps,
					source.pkg.dir,
					injectedDeps,
					failedDeps
				);
			}
		});

	Object.keys(injectedDeps).forEach(dep => {
		log.info(
			'inject-peer-dependencies',
			'Injected dependency',
			`${dep}@${injectedDeps[dep]}`
		);
	});

	Object.keys(failedDeps).forEach(dep => {
		log.warn(
			'inject-peer-dependencies',
			'Failed to resolve dependency',
			dep,
			'with error:',
			failedDeps[dep]
		);
	});
}

/**
 * Process dependencies of a file.
 * @param {Object} pkgJson processed module's package.json
 * @param {Array} deps array of dependencies as passed to define() call
 * @param {FilePath} resolveDir path from where to resolve dependencies
 * @param {Object} injectedDeps a hash to fill with resolved dependencies
 * @param {Object} failedDeps a hash to fill with failed dependencies
 * @return {void}
 */
function processModuleDependencies(
	pkgJson,
	deps,
	resolveDir,
	injectedDeps,
	failedDeps
) {
	deps.forEach(dep => {
		if (!mod.isExternalDependency(dep) || mod.isNodeCoreModule(dep)) {
			return;
		}

		const {pkgName, scope} = mod.splitModuleName(dep);
		const scopedPkgName = mod.joinModuleName(scope, pkgName);

		if (!pkgJson.dependencies[scopedPkgName]) {
			const srcPkgName = ns.removeNamespace(scopedPkgName);

			try {
				const resolvedPkgJsonPath = resolve.sync(
					`${srcPkgName}/package.json`,
					{
						basedir: resolveDir.asNative,
					}
				);

				const resolvedPkgJson = readJsonSync(resolvedPkgJsonPath);

				pkgJson.dependencies[scopedPkgName] = resolvedPkgJson.version;

				injectedDeps[scopedPkgName] = resolvedPkgJson.version;
			} catch (err) {
				failedDeps[dep] = err;
			}
		}
	});
}

/**
 * Removes module name argument from a define call
 * @param  {String} line the line containing a define call
 * @return {String} the rest of the line without module name
 */
function removeModuleName(line) {
	let inString = false;

	for (let i = 0; i < line.length; i++) {
		if (inString) {
			if (line[i] === inString) {
				inString = false;
			}
		} else {
			switch (line[i]) {
				case "'":
				case '"':
					inString = line[i];
					break;

				case ',':
					return line.substr(i + 1);

				default:
				// Keep scanning.
			}
		}
	}

	return '';
}

/**
 * Extracts dependencies argument from a define call
 * @param  {String} line the line containing a define call starting at the
 * 							dependencies argument
 * @return {Array} an array with
 */
function extractDependencies(line) {
	const indexOfClose = line.indexOf(']');

	if (!line.startsWith('[') || indexOfClose == -1) {
		return [];
	}

	return line
		.substring(1, indexOfClose)
		.split(',')
		.map(dep => dep.trim())
		.map(dep => dep.replace(/['"]/g, ''));
}
