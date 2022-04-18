/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable @liferay/no-dynamic-require */

const fs = require('fs');
const path = require('path');

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
		const bridgeSource = `
import * as esModule from "${esModule}";

Liferay.Loader.define(
	"${pkgJson.name}@${pkgJson.version}/${amdModule}",
	['module'], 
	function (module) {
		module.exports = esModule;
	}
);
`;

		const jsFilePath = amdModule + '.js';

		fs.writeFileSync(
			path.resolve(output, ...jsFilePath.split('/')),
			bridgeSource,
			'utf8'
		);

		manifest.packages['/'].modules[jsFilePath] = {
			flags: {
				esModule: true,
				useESM: true,
			},
		};
	});
}

module.exports = createEsm2AmdCustomBridges;
