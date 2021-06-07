/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

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
						nohoist: ['**', '**/**'],
						packages: ['packages/*'],
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
		.filter((project) =>
			fs.statSync(path.join(pkgsDir, project)).isDirectory()
		)
		.forEach((project) => {
			modifyPackageJson(
				path.join(pkgsDir, project, 'package.json'),
				(pkgJson) => {
					const deleted = {
						dependencies: {},
						devDependencies: {},
					};

					toolkitProjectNames.forEach((prjName) => {
						if (pkgJson.dependencies[prjName]) {
							deleted.dependencies[prjName] =
								pkgJson.dependencies[prjName];

							console.log(`delete ${prjName} @ ${project}`);
							delete pkgJson.dependencies[prjName];
						}

						if (pkgJson.devDependencies[prjName]) {
							deleted.devDependencies[prjName] =
								pkgJson.devDependencies[prjName];

							console.log(`delete ${prjName} @ ${project}`);
							delete pkgJson.devDependencies[prjName];
						}
					});

					if (
						Object.keys(deleted.dependencies).length > 0 ||
						Object.keys(deleted.devDependencies).length > 0
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
			.filter((project) =>
				fs.statSync(path.join(pkgsDir, project)).isDirectory()
			)
			.forEach((project) => {
				const prjBinPath = path.join(
					'packages',
					project,
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
