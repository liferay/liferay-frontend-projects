/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

const fs = require('fs-extra');
const path = require('path');

const {
	modifyPackageJson,
	toolkitProjectNames,
	yarn,
	yarnLink,
} = require('./util');

module.exports = function () {
	const pkgsDir = path.join('.', 'packages');

	// Create package.json if missing

	if (!fs.existsSync('package.json')) {
		console.log('\n--- Writing workspace package.json file\n');
		fs.writeFileSync(
			'package.json',
			JSON.stringify(
				{
					private: true,
					workspaces: {
						packages: ['packages/*'],
						nohoist: ['**', '**/**'],
					},
				},
				null,
				'	'
			)
		);
	}

	// Remove all toolkit projects from subprojects

	console.log('\n--- Removing all JS Toolkit dependencies from projects\n');
	fs.readdirSync(pkgsDir)
		.filter((prj) => fs.statSync(path.join(pkgsDir, prj)).isDirectory())
		.filter((prj) => fs.existsSync(path.join(pkgsDir, prj, 'package.json')))
		.forEach((prj) => {
			modifyPackageJson(
				path.join(pkgsDir, prj, 'package.json'),
				(pkgJson) => {
					const deleted = {
						dependencies: {},
						devDependencies: {},
					};

					toolkitProjectNames.forEach((prjName) => {
						if (pkgJson.dependencies[prjName]) {
							deleted.dependencies[prjName] =
								pkgJson.dependencies[prjName];

							console.log(`delete ${prjName} @ ${prj}`);
							delete pkgJson.dependencies[prjName];
						}

						if (pkgJson.devDependencies[prjName]) {
							deleted.devDependencies[prjName] =
								pkgJson.devDependencies[prjName];

							console.log(`delete ${prjName} @ ${prj}`);
							delete pkgJson.devDependencies[prjName];
						}
					});

					if (
						!!Object.keys(deleted.dependencies).length ||
						!!Object.keys(deleted.devDependencies).length
					) {
						pkgJson['link-js-toolkit'] = {
							deleted,
						};
					}
				}
			);
		});

	// Now run yarn install

	console.log('\n--- Running yarn install\n');
	yarn('install');

	// Now link dependencies in workspace

	console.log('\n--- Linking all JS Toolkit packages\n');
	yarnLink(toolkitProjectNames);

	// Now link binaries in subprojects

	console.log('\n--- Linking all binaries in subprojects\n');
	fs.readdirSync(path.join('node_modules', '.bin')).forEach((bin) => {
		const binPath = path.join('node_modules', '.bin', bin);

		fs.readdirSync(pkgsDir)
			.filter((prj) => fs.statSync(path.join(pkgsDir, prj)).isDirectory())
			.forEach((prj) => {
				const prjBinPath = path.join(
					'packages',
					prj,
					'node_modules',
					'.bin',
					bin
				);

				if (!fs.existsSync(prjBinPath)) {
					console.log('symlink', binPath, '->', prjBinPath);
					fs.ensureSymlinkSync(binPath, prjBinPath);
				}
			});
	});
};
