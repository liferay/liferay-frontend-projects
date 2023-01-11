/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable @liferay/no-dynamic-require */

const fs = require('fs');
const path = require('path');

const getBndWebContextPath = require('./getBndWebContextPath');

/**
 * Create a .js file to make ES index module available as a Liferay-AMD module.
 *
 * @param {string} projectDir path to project's directory
 * @param {object} buildConfig
 */
function createEsm2AmdIndexBridge(projectDir, buildConfig, manifest) {
	const pkgJson = require(path.join(projectDir, 'package.json'));

	const {main, output} = buildConfig;

	const webContextPath = getBndWebContextPath(projectDir);

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

	for (const fileName of main) {
		const baseName = path.parse(fileName).name;

		const rootDir = pkgJson.name.startsWith('@')
			? '../../../..'
			: '../../..';

		const bridgeSource = `
	import * as esModule from "${rootDir}${webContextPath}/__liferay__/${baseName}.js";
	
	Liferay.Loader.define(
		"${pkgJson.name}@${pkgJson.version}/${baseName}",
		['module'], 
		function (module) {
			module.exports = esModule;
		}
	);
	`;

		const baseNameWithExt = baseName + '.js';

		fs.writeFileSync(
			path.resolve(output, baseNameWithExt),
			bridgeSource,
			'utf8'
		);

		manifest.packages = manifest.packages ?? {};
		manifest.packages['/'] = manifest.packages['/'] ?? {};
		manifest.packages['/'].modules = manifest.packages['/'].modules ?? {};

		manifest.packages['/'].modules[baseNameWithExt] = {
			flags: {
				esModule: true,
				useESM: true,
			},
		};
	}
}

module.exports = createEsm2AmdIndexBridge;
