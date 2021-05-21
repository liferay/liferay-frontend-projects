#!/usr/bin/env node

/**
 * SPDX-FileCopyrightText: © 2020 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

/* eslint-disable @liferay/liferay/no-dynamic-require */
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

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

/* eslint-disable sort-keys */
const output = {
	dir: path.resolve(__dirname, '..', '..', platformName),
	configJson: {
		'/': {
			plugins: ['resolve-linked-dependencies'],
			'.babelrc': {
				presets: ['liferay-standard'],
			},
			'post-plugins': [
				'namespace-packages',
				'inject-imports-dependencies',
			],
		},
		'*': {
			'copy-plugins': ['exclude-imports'],
			plugins: ['replace-browser-modules'],
			'.babelrc': {
				presets: ['liferay-standard'],
			},
			'post-plugins': [
				'namespace-packages',
				'inject-imports-dependencies',
				'inject-peer-dependencies',
			],
		},
		config: {
			imports: {},
		},
		rules: [
			{
				description: 'Copy static assets',
				test: '^assets/.*',
				use: [
					{
						loader: 'copy-loader',
					},
				],
			},
			{
				description: 'Transpile .js files with Babel',
				test: '^src/.*\\.js$',
				exclude: 'node_modules',
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: ['env', 'react'],
						},
					},
				],
			},
		],
		sources: ['assets', 'src'],
	},
	pkgJson: {
		bin: {
			liferay: './liferay.js',
		},
		dependencies: {
			'babel-preset-env': '1.7.0',
			'babel-preset-liferay-standard': '2.24.3',
			'babel-preset-react': '6.24.1',
			'liferay-npm-bundler': '^2.24.3',
			'liferay-npm-bundler-loader-copy-loader': '2.24.3',
			'liferay-npm-bundler-loader-babel-loader': '2.24.3',
			'liferay-npm-bundler-plugin-exclude-imports': '2.24.3',
			'liferay-npm-bundler-plugin-inject-imports-dependencies': '2.24.3',
			'liferay-npm-bundler-plugin-inject-peer-dependencies': '2.24.3',
			'liferay-npm-bundler-plugin-namespace-packages': '2.24.3',
			'liferay-npm-bundler-plugin-replace-browser-modules': '2.24.3',
			'liferay-npm-bundler-plugin-resolve-linked-dependencies': '2.24.3',
		},
		description: 'Target Platform for liferay-' + platformName,
		main: 'config.json',
		name: '@liferay/' + platformName,
		version: '1.0.0',
	},
};
/* eslint-enable sort-keys */

//
// Initialize output config.json
//

output.configJson.config.imports = {
	...output.configJson.config.imports,
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

//
// Initialize output package.json
//

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
				const pkgJsonPath = require.resolve(
					packageName + '/package.json',
					{
						paths: [providerDir],
					}
				);
				const pkgJson = require(pkgJsonPath);

				dependencies[packageName] = pkgJson.version;
			}
			catch (err) {
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

output.pkgJson.dependencies = {
	...output.pkgJson.dependencies,
	...Object.keys(dependencies)
		.sort()
		.reduce((sortedDependencies, packageName) => {
			sortedDependencies[packageName] = dependencies[packageName];

			return sortedDependencies;
		}, {}),
};

//
// Produce output
//

fs.mkdirSync(output.dir, {recursive: true});
fs.writeFileSync(
	path.join(output.dir, 'package.json'),
	JSON.stringify(output.pkgJson, null, '\t')
);
fs.writeFileSync(
	path.join(output.dir, 'config.json'),
	JSON.stringify(output.configJson, null, '\t')
);

//
// Copy static assets
//

const assetsDir = path.resolve(__dirname, '..', 'assets');

fs.readdirSync(assetsDir).forEach((file) => {
	const sourcePath = path.join(assetsDir, file);
	const targetPath = path.join(output.dir, file);

	fs.writeFileSync(targetPath, fs.readFileSync(sourcePath));
	fs.chmodSync(targetPath, fs.statSync(sourcePath).mode);
});
