/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');
const {
	container: {ModuleFederationPlugin},
} = require('webpack');

const createTempFile = require('./createTempFile');
const parseBnd = require('./parseBnd');
const writeWebpackFederationEntryPoint = require('./writeWebpackFederationEntryPoint');

/**
 * This object must represent the current configuration status of the portal's
 * project if we don't want to break the build. It contains, for each
 * federation-enabled project, the packages that are federated.
 *
 * Note that there's no real need to define federated packages per project as
 * the relation is not used for anything. However, it is better to do it this
 * way, because if we mix all together we end up with a very entangled
 * configuration.
 *
 * Note also that when you want to include a project in the federated build to
 * consume other packages (even if it doesn't publish any package) you must
 * declare it here.
 */
const FEDERATED_PACKAGES = {
	'frontend-js-react-web': [
		'classnames',
		'formik',
		'prop-types',
		'react',
		'react-dnd',
		'react-dnd-html5-backend',
		'react-dom',
	],
	'frontend-js-web': [],
	'frontend-taglib-clay': ['@clayui/icon'],
	'portal-template-react-renderer-impl': [],
};

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
				remotes: Object.keys(FEDERATED_PACKAGES).reduce(
					(remotes, name) => {
						remotes[
							name
						] = `window[Symbol.for("__LIFERAY_WEBPACK_CONTAINERS__")]["${name}"]@/o/${name}/__generated__/container.js`;

						return remotes;
					},
					{}
				),
				shared: []
					.concat(...Object.values(FEDERATED_PACKAGES))
					.reduce((shared, name) => {
						shared[name] = {singleton: true};

						return shared;
					}, {}),
			}),
		],
	};
};
