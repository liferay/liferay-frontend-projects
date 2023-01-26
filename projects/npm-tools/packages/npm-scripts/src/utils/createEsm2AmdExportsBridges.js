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

	const webContextPath = getBndWebContextPath(projectDir);

	const {exports, output} = buildConfig;

	exports.forEach((exportItem) => {
		const splittedModuleName = splitModuleName(exportItem.name);
		const {pkgName, scope} = splittedModuleName;
		let {modulePath} = splittedModuleName;

		// Compute src and destination package.json objects

		const scopedPkgName = joinModuleName(scope, pkgName, '');

		const srcPkgJson = require(resolve.sync(
			`${scopedPkgName}/package.json`,
			{
				basedir: projectDir,
			}
		));

		const pkgJson = {
			dependencies: {},
			name: addNamespace(scopedPkgName, rootPkgJson),
			version: srcPkgJson.version,
		};

		// Tweak module path and package.json main's field

		if (!modulePath) {
			modulePath = '/index';
			pkgJson.main = './index.js';
		}

		// Create output package dir

		const packageDir = path.join(
			output,
			'node_modules',
			getPackageTargetDir({
				name: pkgJson.name,
				version: pkgJson.version,
			})
		);

		fs.mkdirSync(packageDir, {recursive: true});

		// Create/update output package.json file

		fs.writeFileSync(
			path.join(packageDir, 'package.json'),
			JSON.stringify(pkgJson, null, '\t'),
			'utf8'
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
		// Also, for internal module paths, we must add more `../`s.
		//

		let rootDir = '../..';

		if (exportItem.name.startsWith('@')) {
			rootDir += '/..';
		}

		const hopsToAdd = modulePath.split('/').length - 1;

		for (let i = 0; i < hopsToAdd; i++) {
			rootDir += '/..';
		}

		rootDir += webContextPath;

		// Create output bridge file

		const pkgId = `${pkgJson.name}@${pkgJson.version}`;

		const bridgeSource = `
import * as esModule from "${rootDir}/__liferay__/exports/${flattenPkgName(
			exportItem.name
		)}.js";

Liferay.Loader.define(
	"${pkgId}${modulePath}",
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

		const outputFilePath = path.join(
			packageDir,
			`${modulePath.substr(1).replace('/', path.sep)}.js`
		);

		fs.mkdirSync(path.dirname(outputFilePath), {recursive: true});

		fs.writeFileSync(outputFilePath, bridgeSource, 'utf8');

		// Update output manifest.json

		if (!manifest.packages[pkgId]) {
			const srcPkgId = `${srcPkgJson.name}@${srcPkgJson.version}`;

			manifest.packages[pkgId] = {
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
		}

		manifest.packages[pkgId].modules[`${modulePath.substr(1)}.js`] = {
			flags: {
				esModule: true,
				useESM: true,
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
