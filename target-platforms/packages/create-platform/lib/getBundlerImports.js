/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const fs = require('fs');

const getNpmbundlerrcFiles = require('./getNpmbundlerrcFiles');
const getPortalConfig = require('./getPortalConfig');
const getPortalVersion = require('./getPortalVersion');
const isPortalDir = require('./isPortalDir');

module.exports = async function getBundlerImports(tagOrDir) {
	let imports;

	if (isPortalDir(tagOrDir)) {
		imports = {};

		getNpmbundlerrcFiles(tagOrDir).forEach((file) => {
			console.log(`Scanning: ${file}`);

			const npmbundlerrc = JSON.parse(fs.readFileSync(file, 'utf8'));

			if (npmbundlerrc.config && npmbundlerrc.config.imports) {
				Object.entries(npmbundlerrc.config.imports).forEach(
					([provider, nameVersions]) => {
						Object.entries(nameVersions).forEach(([name]) => {
							if (!imports[provider]) {
								imports[provider] = {};
							}

							imports[provider][name] = '*';
						});
					}
				);
			}
		});

		const sortedImports = {};

		Object.keys(imports)
			.sort()
			.forEach((key) => {
				sortedImports[key] = imports[key];
			});

		imports = sortedImports;
	}
	else {
		const portalVersion = await getPortalVersion(tagOrDir);
		const portalConfig = await getPortalConfig(portalVersion);

		imports = portalConfig.build.bundler.config.imports;
	}

	return imports;
};
