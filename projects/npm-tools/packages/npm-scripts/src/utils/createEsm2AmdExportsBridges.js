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

/**
 * Create .js files to make ES modules available as Liferay-AMD modules.
 *
 * @param {string} projectDir path to project's directory
 * @param {object} buildConfig
 * @param {object} manifest
 */
function createEsm2AmdExportsBridges(projectDir, buildConfig, manifest) {
	const rootPkgJson = require(path.join(projectDir, 'package.json'));

	const webContextPath = getBndWebContextPath() || `/${rootPkgJson.name}`;

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

		const bridgeSource = `
import * as esModule from "${rootDir}/__liferay__/exports/${flattenPkgName(
			exportItem.name
		)}.js";

Liferay.Loader.define(
	"${pkgId}/index",
	['module'], 
	function (module) {
		module.exports = {
			__esModule: true,
			default: esModule,
			...esModule,
		};
	}
);
`;

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

		manifest.packages[srcPkgId] = manifest.packages[srcPkgId] || {
			dest: {
				dir: '.',
				id: pkgId,
				name: pkgJson.name,
				version: pkgJson.version,
			},
			modules: {},
			src: {
				id: srcPkgId,
				name: srcPkgJson.name,
				version: srcPkgJson.version,
			},
		};

		manifest.packages[srcPkgId].modules['index.js'] = {
			flags: {
				esModule: true,
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
