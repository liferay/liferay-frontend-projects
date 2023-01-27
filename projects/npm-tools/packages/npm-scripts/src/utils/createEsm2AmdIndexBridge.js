/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable @liferay/no-dynamic-require */

const fs = require('fs');
const path = require('path');

const getBndWebContextPath = require('./getBndWebContextPath');
const hashPathForVariable = require('./hashPathForVariable');

/**
 * Create a .js file to make ES index module available as a Liferay-AMD module.
 *
 * @param {string} projectDir path to project's directory
 * @param {object} buildConfig
 */
function createEsm2AmdIndexBridge(projectDir, buildConfig, manifest) {
	const pkgJson = require(path.join(projectDir, 'package.json'));

	const {output} = buildConfig;

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

	const rootDir = pkgJson.name.startsWith('@') ? '../../../..' : '../../..';

	const importPath = `${rootDir}${webContextPath}/__liferay__/index.js`;

	const hashedModulePath = hashPathForVariable(importPath);

	const bridgeSource = `
import * as ${hashedModulePath} from "${importPath}";

Liferay.Loader.define(
	"${pkgJson.name}@${pkgJson.version}/index",
	['module'], 
	function (module) {
		module.exports = ${hashedModulePath};
	}
);
`;

	fs.writeFileSync(path.resolve(output, 'index.js'), bridgeSource, 'utf8');

	manifest.packages = manifest.packages ?? {};
	manifest.packages['/'] = manifest.packages['/'] ?? {};
	manifest.packages['/'].modules = manifest.packages['/'].modules ?? {};

	manifest.packages['/'].modules['index.js'] = {
		flags: {
			esModule: true,
			useESM: true,
		},
	};
}

module.exports = createEsm2AmdIndexBridge;
