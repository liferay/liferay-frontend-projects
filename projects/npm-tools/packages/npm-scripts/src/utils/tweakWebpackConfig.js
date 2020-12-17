/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const {transformJsSource} = require('@liferay/js-toolkit-core');
const fs = require('fs');
const path = require('path');
const {
	container: {ModuleFederationPlugin},
} = require('webpack');

const relocateImports = require('../transform/js/relocateImports');
const getBridgeExportName = require('../utils/getBridgeExportName');
const createTempFile = require('./createTempFile');
const getMergedConfig = require('./getMergedConfig');
const parseBnd = require('./parseBnd');

const CORE_REMOTES = ['frontend-js-react-web', 'frontend-taglib-clay'];
const CORE_SHARES = [
	'@clayui/icon',
	'classnames',
	'formik',
	'prop-types',
	'react',
	'react-dnd',
	'react-dnd-html5-backend',
	'react-dom',
];

/**
 * Modify an existing webpack config to conform to Liferay standards.
 *
 * @param {string} webpackConfigPath path to a `wepack.config.js` file
 *
 * @return {Promise<object|object[]>}
 * A promise to be resolved with the tweaked webpack config.
 */
async function tweakWebpackConfig(webpackConfigPath) {
	/* eslint-disable @liferay/liferay/no-dynamic-require */
	const webpackConfig = fs.existsSync(webpackConfigPath)
		? require(webpackConfigPath)
		: undefined;
	/* eslint-enable @liferay/liferay/no-dynamic-require */

	let arrayConfig;

	if (!webpackConfig) {
		arrayConfig = [];
	}
	else if (Array.isArray(webpackConfig)) {
		arrayConfig = webpackConfig;
	}
	else {
		arrayConfig = [webpackConfig];
	}

	const {federation} = getMergedConfig('npmscripts');

	if (federation) {
		arrayConfig.push(await createFederationConfig());
	}

	arrayConfig = arrayConfig.map((webpackConfig) =>
		mergeBabelLoaderOptions(webpackConfig)
	);

	return arrayConfig.length === 1 ? arrayConfig[0] : arrayConfig;
}

/**
 * Create a webpack configuration to inject federation support to the build.
 *
 * Note that the default federation configuration exports the "main" entry point
 * as a federation module and makes it available through Liferay DXP.
 *
 * @return {Promise<object>}
 * A Promise to be resolved with a webpack configuration object.
 */
async function createFederationConfig() {
	/* eslint-disable-next-line @liferay/liferay/no-dynamic-require */
	const packageJson = require(path.resolve('package.json'));
	const bnd = parseBnd();

	const name = packageJson.name;
	const webContextPath = bnd['Web-ContextPath'] || name;

	const {filePath: nullJsFilePath} = createTempFile('null.js', '');
	const {filePath: mainFilePath} = createTempFile('index.federation.js', '');

	await writeIndexFederationContents(mainFilePath);

	return {
		context: process.cwd(),
		devtool: 'source-map',
		entry: nullJsFilePath,
		module: {
			rules: [
				{
					exclude: /node_modules/,
					test: /\.js$/,
					use: {
						loader: 'babel-loader',
						options: {
							plugins: [
								'@babel/plugin-proposal-class-properties',
							],
							presets: ['@babel/preset-react'],
						},
					},
				},
				{
					exclude: /node_modules/,
					test: /\.scss$/,
					use: ['style-loader', 'css-loader', 'sass-loader'],
				},
			],
		},
		output: {
			filename: 'main.bundle.js',
			path: path.resolve(
				'./build/node/packageRunBuild/resources/__generated__'
			),
			publicPath: `/o${webContextPath}/__generated__/`,
		},
		plugins: [
			new ModuleFederationPlugin({
				exposes: {
					'.': mainFilePath,
				},
				filename: 'container.js',
				library: {
					name: `window[Symbol.for("__LIFERAY_WEBPACK_CONTAINERS__")]["${name}"]`,
					type: 'assign',
				},
				name,
				remoteType: 'script',
				remotes: CORE_REMOTES.reduce((remotes, name) => {
					remotes[
						name
					] = `window[Symbol.for("__LIFERAY_WEBPACK_CONTAINERS__")]["${name}"]@/o/${name}/__generated__/container.js`;

					return remotes;
				}, {}),
				shared: CORE_SHARES.reduce((shared, name) => {
					shared[name] = {singleton: true};

					return shared;
				}, {}),
			}),
		],
	};
}

/**
 * Modify all babel-loader options so that they include our defaults.
 *
 * @param {object} webpackConfig
 * The object which has been exported from the webpack.config.js file.
 */
function mergeBabelLoaderOptions(webpackConfig) {
	if (!webpackConfig.module) {
		return webpackConfig;
	}

	if (!webpackConfig.module.rules) {
		return webpackConfig;
	}

	const babelConfig = getMergedConfig('babel');

	return {
		...webpackConfig,
		module: {
			...webpackConfig.module,
			rules: webpackConfig.module.rules.map((rule) => {
				const {use} = rule;

				if (!use) {
					return rule;
				}

				const mergeUseEntry = (useEntry) => {
					if (useEntry === 'babel-loader') {
						return {
							loader: useEntry,
							options: {...babelConfig},
						};
					}
					else if (useEntry.loader === 'babel-loader') {
						return {
							...useEntry,
							options: {...babelConfig, ...useEntry.options},
						};
					}

					return useEntry;
				};

				return {
					...rule,
					use: Array.isArray(use)
						? use.map((useEntry) => mergeUseEntry(useEntry))
						: mergeUseEntry(use),
				};
			}),
		},
	};
}

/**
 * Create a webpack main entry point containing the standard entry points
 * contents plus a re-export of all the bridged packages.
 *
 * @param {string} filePath the path to the output file
 *
 * @return {Promise<void>}
 */
async function writeIndexFederationContents(filePath) {
	const buildConfig = getMergedConfig('npmscripts', 'build');
	/* eslint-disable-next-line @liferay/liferay/no-dynamic-require */
	const packageJson = require(path.resolve('package.json'));
	const main = packageJson.main || 'index.js';

	const mainFilePath = path.join(
		buildConfig.input,
		path.sep === '\\' ? main.replace(/\//g, '\\') : main
	);

	const previousDirRelPath = path.relative(
		path.dirname(filePath),
		path.dirname(mainFilePath)
	);

	let {code} = await transformJsSource(
		{code: fs.readFileSync(mainFilePath, 'utf8')},
		relocateImports(previousDirRelPath)
	);

	code += '\n';

	// Export project's main module for bridges

	const mainFileName = path.basename(mainFilePath);

	code += `export * from './${previousDirRelPath}/${mainFileName}'\n`;

	// Export internal dependencies for bridges

	const {bridges} = getMergedConfig('npmscripts', 'federation');

	for (const packageName of bridges || []) {
		const exportName = getBridgeExportName(packageName);

		code += `export * as ${exportName} from '${packageName}';\n`;
	}

	fs.writeFileSync(filePath, code);
}

module.exports = tweakWebpackConfig;
