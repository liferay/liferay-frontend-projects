/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable @liferay/no-dynamic-require */

const fs = require('fs');
const path = require('path');

const hashPathForVariable = require('./hashPathForVariable');

/**
 * Create .js files to make ES modules available as Liferay-AMD modules.
 *
 * @param {string} projectDir path to project's directory
 * @param {object} buildConfig
 * @param {object} manifest
 */
function createEsm2AmdCustomBridges(projectDir, buildConfig, manifest) {
	const {customBridges, output} = buildConfig;

	if (!customBridges) {
		return;
	}

	const pkgJson = require(path.join(projectDir, 'package.json'));

	Object.entries(customBridges).forEach(([amdModule, esModule]) => {
		const hashedModulePath = hashPathForVariable(esModule);

		const bridgeSource = `
import * as ${hashedModulePath} from "${esModule}";

Liferay.Loader.define(
	"${pkgJson.name}@${pkgJson.version}/${amdModule}",
	['module'], 
	function (module) {
		module.exports = ${hashedModulePath};
	}
);
`;

		const jsModulePath = amdModule + '.js';

		const jsFilePath = path.resolve(output, ...jsModulePath.split('/'));

		fs.mkdirSync(path.dirname(jsFilePath), {recursive: true});

		fs.writeFileSync(jsFilePath, bridgeSource, 'utf8');

		manifest.packages['/'].modules[jsModulePath] = {
			flags: {
				esModule: true,
				useESM: true,
			},
		};
	});
}

module.exports = createEsm2AmdCustomBridges;
