#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable no-console */

const {spawnSync} = require('child_process');
const path = require('path');

const getBaseConfigJson = require('../lib/getBaseConfigJson');
const getBasePackageJson = require('../lib/getBasePackageJson');
const getBundlerImports = require('../lib/getBundlerImports');
const getDependencyVersion = require('../lib/getDependencyVersion');
const getPortalVersion = require('../lib/getPortalVersion');
const getPortalYarnLock = require('../lib/getPortalYarnLock');
const writePlatform = require('../lib/writePlatform');

const IGNORED_PROVIDERS = ['frontend-js-node-shims'];
const IGNORED_PROVIDES = ['/'];

const platformsDir = path.resolve(__dirname, '..', '..');

async function main([portalTagOrDir, platformName]) {

	// Find out bundler imports

	const imports = await getBundlerImports(portalTagOrDir);

	// Initialize output config.json

	const configJson = getBaseConfigJson(platformName);

	configJson.config.imports = {
		...configJson.config.imports,
		...Object.entries(imports).reduce((imports, [provider, provides]) => {
			if (IGNORED_PROVIDERS.includes(provider)) {
				return imports;
			}

			imports[provider] = Object.entries(provides).reduce(
				(provides, [packageName, _version]) => {
					provides[packageName] = '*';

					return provides;
				},
				{}
			);

			return imports;
		}, {}),
	};

	// Initialize output package.json

	const portalVersion = getPortalVersion(portalTagOrDir);

	const packageJson = getBasePackageJson(platformName, portalVersion);

	const portalYarnLock = await getPortalYarnLock(portalTagOrDir);

	const dependencies = Object.entries(imports).reduce(
		(dependencies, [provider, provides]) => {
			if (IGNORED_PROVIDERS.includes(provider)) {
				return dependencies;
			}

			Object.keys(provides).forEach((packageName) => {
				if (IGNORED_PROVIDES.includes(packageName)) {
					return;
				}

				dependencies[packageName] = getDependencyVersion(
					packageName,
					portalYarnLock
				);

				if (dependencies[packageName] === undefined) {
					console.log(
						`WARNING: Could not determine version for ` +
							`${packageName} @ ${provider}`
					);

					dependencies[packageName] = provider;
				}
			});

			return dependencies;
		},
		{}
	);

	// Sort dependencies

	packageJson.dependencies = {
		...packageJson.dependencies,
		...Object.keys(dependencies)
			.sort()
			.reduce((sortedDependencies, packageName) => {
				sortedDependencies[packageName] = dependencies[packageName];

				return sortedDependencies;
			}, {}),
	};

	// Produce output

	writePlatform(platformName, packageJson, configJson);

	// Run yarn format

	const result = spawnSync('npx', ['prettier', '-w', `${platformName}/**`], {
		cwd: platformsDir,
		shell: true,
		stdio: 'inherit',
	});

	if (result.status) {
		process.exit(result.status);
	}
}

const args = process.argv.slice(2);

if (args.length !== 2) {
	console.log(
		'\nUsage: create-plaform <liferay-portal tag/dir> <target platform name>\n'
	);
	process.exit(1);
}

main(args);
