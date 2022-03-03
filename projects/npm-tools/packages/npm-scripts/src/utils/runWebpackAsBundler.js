/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

/* eslint-disable @liferay/no-dynamic-require */

const path = require('path');
const resolve = require('resolve');
const TerserPlugin = require('terser-webpack-plugin');

const convertImportsToExternals = require('./convertImportsToExternals');
const createTempFile = require('./createTempFile');
const flattenPkgName = require('./flattenPkgName');
const runWebpack = require('./runWebpack');

/**
 * Runs webpack as a replacement of the bundler
 */
module.exports = async function runWebpackAsBundler(config) {
	const start = Date.now();

	const webpackConfigs = getWebpackConfigs(config);

	for (const webpackConfig of webpackConfigs) {
		await runWebpack(webpackConfig, config.report);
	}

	const lapse = Math.floor((Date.now() - start) / 1000);

	/* eslint-disable-next-line no-console */
	console.log(`ESM bundling took ${lapse}s`);
};

function getEntryImportDescriptor(exportsItem) {
	const pkgName = exportsItem.package;
	const flatPkgName = flattenPkgName(pkgName);
	let importPath = pkgName;

	if (exportsItem.rewriteExports) {
		const exportObject = require(resolve.sync(pkgName, {basedir: '.'}));

		const nonDefaultFields = Object.keys(exportObject)
			.filter((field) => field !== 'default')
			.map((field) => `	${field}`)
			.join(',\n');

		const bridgeSource = `
import * as entryImport from '${pkgName}';

const {
${nonDefaultFields}
} = entryImport;

export {
${nonDefaultFields}
};
`;
		const {filePath} = createTempFile(`${flatPkgName}.js`, bridgeSource, {
			autoDelete: false,
		});

		importPath = filePath;
	}

	return {
		flatPkgName,
		importPath,
		pkgName,
	};
}

function getWebpackConfigs(config) {
	const {exports, imports} = config;

	return exports.reduce((webpackConfigs, exportsItem) => {
		const {flatPkgName, importPath, pkgName} = getEntryImportDescriptor(
			exportsItem
		);

		const externals = convertImportsToExternals(imports);

		delete externals[pkgName];

		const webpackConfig = {
			devtool: 'cheap-source-map',
			entry: {
				[`__liferay__/exports/${flatPkgName}`]: {
					import: importPath,
				},
			},
			experiments: {
				outputModule: true,
			},
			externals,
			externalsType: 'module',
			mode: 'development',
			module: {
				rules: [
					{
						exclude: /node_modules/,
						test: /\.js$/,
						use: {
							loader: require.resolve('babel-loader'),
							options: {
								presets: [
									require.resolve('@babel/preset-env'),
									require.resolve('@babel/preset-react'),
								],
							},
						},
					},
				],
			},
			optimization: {
				minimizer: [
					new TerserPlugin({
						extractComments: false,
					}),
				],
			},
			output: {
				environment: {
					dynamicImport: true,
					module: true,
				},
				filename: '[name].js',
				library: {
					type: 'module',
				},
				path: path.resolve(config.output),
			},
			plugins: [],
			resolve: {
				fallback: {
					path: false,
				},
			},
		};

		if (config.report) {
			createTempFile(
				`${flatPkgName}.webpack.config.json`,
				JSON.stringify(webpackConfig, null, 2),
				{autoDelete: false}
			);
		}

		webpackConfigs.push(webpackConfig);

		return webpackConfigs;
	}, []);
}
