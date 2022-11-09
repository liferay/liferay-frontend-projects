/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable @liferay/no-dynamic-require */

const {
	addNamespace,
	joinModuleName,
	splitModuleName,
} = require('@liferay/js-toolkit-core');
const fs = require('fs');
const path = require('path');
const resolve = require('resolve');

const flattenPkgName = require('./flattenPkgName');
const getBndWebContextPath = require('./getBndWebContextPath');

function createBridgeSource(importPath, moduleName) {
	return `
import * as esModule from "${importPath}";

Liferay.Loader.define(
	"${moduleName}",
	['module'], 
	function (module) {
		module.exports = {
			__esModule: true,
			default: esModule,
			...esModule,
		};
	}
);`;
}

/**
 * Create .js files to make ES modules available as Liferay-AMD modules.
 *
 * @param {string} projectDir path to project's directory
 * @param {object} buildConfig
 * @param {object} manifest
 */
function createEsm2AmdExportsBridges(projectDir, buildConfig, manifest) {
	const rootPkgJson = require(path.join(projectDir, 'package.json'));

	const webContextPath = getBndWebContextPath(projectDir);

	const {exports, output} = buildConfig;

	exports.forEach((exportItem) => {
		const {pkgName, scope} = splitModuleName(exportItem.name);

		const scopedPkgName = joinModuleName(scope, pkgName, '');

		const srcPkgJson = require(resolve.sync(
			`${scopedPkgName}/package.json`,
			{
				basedir: projectDir,
			}
		));
		const srcPkgId = `${srcPkgJson.name}@${srcPkgJson.version}`;

		const pkgJson = {
			dependencies: {},
			main: './index.js',
			name: addNamespace(scopedPkgName, rootPkgJson),
			version: srcPkgJson.version,
		};
		const pkgId = `${pkgJson.name}@${pkgJson.version}`;

		const packageDir = path.join(
			output,
			'node_modules',
			getPackageTargetDir({
				name: pkgJson.name,
				version: pkgJson.version,
			})
		);

		//
		// Compute the relative position of the bridge related to the real ES
		// module.
		//
		// Note that AMD modules are server under `/o/js/resolved-module/...`
		// whereas ESM are under `/o/my-context-path/__liferay__/exports/...`.
		//
		// Also, depending for npm-scoped scoped packages, and additional folder
		// level appears under `/o/js/resolved-module/...`.
		//

		const rootDir = exportItem.name.startsWith('@')
			? `../../../..${webContextPath}`
			: `../../..${webContextPath}`;

		const importPath = `${rootDir}/__liferay__/exports/${flattenPkgName(
			exportItem.name
		)}.js`;

		const bridgeSource = createBridgeSource(importPath, `${pkgId}/index`);

		fs.mkdirSync(packageDir, {recursive: true});

		fs.writeFileSync(
			path.join(packageDir, 'package.json'),
			JSON.stringify(pkgJson, null, '\t'),
			'utf8'
		);

		fs.writeFileSync(
			path.join(packageDir, 'index.js'),
			bridgeSource,
			'utf8'
		);

		const modules = {};

		if (exportItem.includeInternalPaths) {
			for (const internalPath of exportItem.includeInternalPaths) {
				const internalPathWithExtension = internalPath + '.js';

				const internalBridgePath = path.join(
					packageDir,
					internalPathWithExtension
				);

				fs.mkdirSync(path.dirname(internalBridgePath), {
					recursive: true,
				});

				const internalId = path.join(pkgId, internalPath);

				let relativePathFromEntry = path.relative(
					path.dirname(internalPath),
					'/'
				);

				relativePathFromEntry = relativePathFromEntry
					? relativePathFromEntry + `/${rootDir}`
					: rootDir;

				const importPath = `${relativePathFromEntry}/__liferay__/exports/${path.join(
					flattenPkgName(exportItem.name),
					internalPathWithExtension
				)}`;

				const bridgeSource = createBridgeSource(importPath, internalId);

				fs.writeFileSync(internalBridgePath, bridgeSource, 'utf8');

				modules[internalPathWithExtension.slice(1)] = {
					flags: {
						esModule: true,
						useESM: true,
					},
				};
			}
		}

		manifest.packages[pkgId] = manifest.packages[pkgId] || {
			dest: {
				dir: '.',
				id: pkgId,
				name: pkgJson.name,
				version: pkgJson.version,
			},
			modules: {
				...modules,
				'index.js': {
					flags: {
						esModule: true,
						useESM: true,
					},
				},
			},
			src: {
				id: srcPkgId,
				name: srcPkgJson.name,
				version: srcPkgJson.version,
			},
		};
	});
}

function getPackageTargetDir(pkgJson) {
	const {name, version} = pkgJson;

	let targetFolder = name.replace('/', '%2F');

	if (version) {
		targetFolder += `@${version}`;
	}

	return targetFolder;
}

module.exports = createEsm2AmdExportsBridges;
