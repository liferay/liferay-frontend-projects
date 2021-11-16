#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2021 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

/* eslint-disable @liferay/no-dynamic-require */
/* eslint-disable no-console */

const path = require('path');

const getBaseConfigJson = require('../lib/getBaseConfigJson');
const getBasePackageJson = require('../lib/getBasePackageJson');
const writePlatform = require('../lib/writePlatform');

const IGNORED_PROVIDERS = ['frontend-js-node-shims'];
const IGNORED_PROVIDES = ['/'];

if (process.argv.length < 4) {
	console.log(
		'\nUsage: create-plaform <liferay-portal dir> <target platform name>\n'
	);
	process.exit(1);
}

const portalDir = path.resolve(process.argv[2]);
const platformName = process.argv[3];

const config = require(path.join(portalDir, 'modules', 'npmscripts.config.js'));

// Initialize output config.json

const configJson = getBaseConfigJson(platformName);

configJson.config.imports = {
	...configJson.config.imports,
	...Object.entries(config.build.bundler.config.imports).reduce(
		(imports, [provider, provides]) => {
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
		},
		{}
	),
};

// Initialize output package.json

const packageJson = getBasePackageJson(platformName);

const dependencies = Object.entries(config.build.bundler.config.imports).reduce(
	(dependencies, [provider, provides]) => {
		if (IGNORED_PROVIDERS.includes(provider)) {
			return dependencies;
		}

		Object.keys(provides).forEach((packageName) => {
			if (IGNORED_PROVIDES.includes(packageName)) {
				return;
			}

			const providerDir = path.join(
				portalDir,
				'modules',
				'node_modules',
				provider
			);

			try {
				const packageJsonPath = require.resolve(
					packageName + '/package.json',
					{
						paths: [providerDir],
					}
				);

				const packageJson = require(packageJsonPath);

				dependencies[packageName] = packageJson.version;
			}
			catch (error) {
				console.log(
					'WARNING: Dependency',
					packageName,
					'of provider',
					provider,
					'could not be resolved; it will be ignored'
				);
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
