/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const getNpmbundlerrcFiles = require('./getNpmbundlerrcFiles');
const getPortalConfig = require('./getPortalConfig');
const getPortalVersion = require('./getPortalVersion');
const isPortalDir = require('./isPortalDir');

const platformsDir = path.resolve(__dirname, '..', '..');

module.exports = async function getBundlerImports(
	platformName,
	tagOrDir,
	isEE
) {
	let imports;

	if (isPortalDir(tagOrDir)) {
		imports = {};

		const npmbundlerrcFiles = getNpmbundlerrcFiles(tagOrDir).reduce(
			(map, file) => {
				const parts = file.split('/');

				const project = parts[parts.length - 2];

				const npmbundlerrc = JSON.parse(fs.readFileSync(file, 'utf8'));

				map[project] = npmbundlerrc;

				return map;
			},
			{}
		);

		const summary = {};

		Object.entries(npmbundlerrcFiles).forEach(([project, npmbundlerrc]) => {
			console.log(`Scanning: ${project}`);

			if (npmbundlerrc.config && npmbundlerrc.config.imports) {
				Object.entries(npmbundlerrc.config.imports).forEach(
					([provider, nameVersions]) => {
						Object.entries(nameVersions).forEach(([name]) => {

							// Check for exclusions

							const exclude =
								npmbundlerrcFiles[provider]?.exclude;

							if (name !== '/' && exclude) {
								if (exclude['*'] === true) {
									console.log(
										`  WARNING: Ignoring ${name} because ${provider} declares wildcard exclusion`
									);

									return;
								}
								else if (exclude[name]) {
									console.log(
										`  WARNING: Package ${name} could be wrong because ${provider} declares some exclusions`
									);

									console.log(
										JSON.stringify(exclude[name], null, 2)
											.split('\n')
											.map((line) => `    ${line}`)
											.join('\n')
									);
								}
							}

							// Update imports

							if (!imports[provider]) {
								imports[provider] = {};
							}

							imports[provider][name] = '*';

							// Update summary

							if (!summary[name]) {
								summary[name] = {};
							}

							summary[name][project] = true;
						});
					}
				);
			}
		});

		saveSummary(platformName, summary);

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
		const portalConfig = await getPortalConfig(portalVersion, isEE);

		imports = portalConfig.build.bundler.config.imports;
	}

	return imports;
};

function saveSummary(platformName, summary) {
	console.log(platformName);

	const file = path.join(platformsDir, platformName, 'summary.json');

	const summaryJson = {};

	Object.keys(summary)
		.sort()
		.forEach((pkgName) => {
			if (pkgName === '/') {
				return;
			}

			summaryJson[pkgName] = [];

			Object.keys(summary[pkgName])
				.sort()
				.forEach((project) => {
					summaryJson[pkgName].push(project);
				});
		});

	fs.writeFileSync(file, JSON.stringify(summaryJson, null, '\t'));
}
