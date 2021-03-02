/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');
const {
	container: {ModuleFederationPlugin},
} = require('webpack');

const {makeNamespace} = require('./bundlerNamespace');
const createTempFile = require('./createTempFile');
const getMergedConfig = require('./getMergedConfig');
const parseBnd = require('./parseBnd');
const writeWebpackFederationEntryPoint = require('./writeWebpackFederationEntryPoint');

/**
 * Create a webpack configuration to inject federation support to the build.
 *
 * Note that the default federation configuration exports the "main" entry point
 * as a federation module and makes it available through Liferay DXP.
 *
 * @return {Promise<object>}
 * A Promise to be resolved with a webpack configuration object.
 */
module.exports = async function () {
	/* eslint-disable-next-line @liferay/liferay/no-dynamic-require */
	const packageJson = require(path.resolve('package.json'));
	const bnd = parseBnd();

	const name = packageJson.name;
	const webContextPath = bnd['Web-ContextPath'] || name;

	const {filePath: nullJsFilePath} = createTempFile('null.js', '');
	const {filePath: mainFilePath} = createTempFile('index.federation.js', '');

	await writeWebpackFederationEntryPoint(mainFilePath);

	const config = getMergedConfig('npmscripts');

	const {build, federation} = config;

	let {exposes, remotes, shared} = federation;

	exposes = exposes || [];
	remotes = remotes || [];
	shared = shared || [];

	// Prevent webpack from choking on scopes

	const libraryName = makeNamespace(name);

	const federationPluginConfig = {
		exposes: {
			...transformExposes(exposes, build.input),
			'.': mainFilePath,
		},
		filename: 'container.js',
		library: {
			name: `window[Symbol.for("__LIFERAY_WEBPACK_CONTAINERS__")]["${libraryName}"]`,
			type: 'assign',
		},
		name,
		remoteType: 'script',
		remotes: remotes.reduce((remotes, remote) => {
			let webContextPath;

			if (typeof remote === 'string') {
				webContextPath = remote;
			}
			else {
				webContextPath = remote.webContextPath;
				remote = remote.name;
			}

			// Prevent webpack from choking on scopes

			const libraryName = makeNamespace(remote);

			remotes[remote] =
				`window[Symbol.for("__LIFERAY_WEBPACK_CONTAINERS__")]` +
				`["${libraryName}"]` +
				`@/o/${webContextPath}/__generated__/container.js`;

			return remotes;
		}, {}),
		shared: shared.reduce((shared, name) => {
			shared[name] = {singleton: true};

			return shared;
		}, {}),
	};

	createTempFile(
		'federation.plugin.config.json',
		JSON.stringify(federationPluginConfig, null, 2),
		{autoDelete: false}
	);

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
		plugins: [new ModuleFederationPlugin(federationPluginConfig)],
		resolve: {
			fallback: {
				path: require.resolve('path-browserify'),
			},
		},
	};
};

function transformExposes(exposes, inputDir) {
	return exposes.reduce((exposes, filePath) => {
		if (!filePath.startsWith('<inputDir>/')) {
			throw new Error(
				"Only paths relative to '<inputDir>/' are accepted as 'exposes'"
			);
		}

		filePath = filePath.replace(/^<inputDir>\//, '');

		const exposeName = filePath.replace(/\.js$/i, '');

		exposes[exposeName] = `./${inputDir}/${filePath}`;

		return exposes;
	}, {});
}
