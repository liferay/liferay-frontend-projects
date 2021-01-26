/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const path = require('path');
const {
	container: {ModuleFederationPlugin},
} = require('webpack');

const createTempFile = require('./createTempFile');
const getMergedConfig = require('./getMergedConfig');
const parseBnd = require('./parseBnd');
const writeWebpackFederationEntryPoint = require('./writeWebpackFederationEntryPoint');

/**
 * The following two arrays are roughly equivalent to the old default preset
 * imports for bundler 2.
 *
 * In the case of `DEFAULT_REMOTES` it serves the same purpose as the `"/"`
 * imports.
 *
 * The `DEFAULT_SHARED` array contains the list of external dependencies that
 * must be shared across all projects.
 */
const DEFAULT_REMOTES = [
	'frontend-js-components-web',
	'frontend-js-metal-web',
	'frontend-js-react-web',
	'frontend-js-spa-web',
	'frontend-js-web',
	'frontend-taglib',
	'frontend-taglib-chart',
	'frontend-taglib-clay',
];
const DEFAULT_SHARED = [
	'@clayui/alert',
	'@clayui/autocomplete',
	'@clayui/badge',
	'@clayui/breadcrumb',
	'@clayui/button',
	'@clayui/card',
	'@clayui/charts',
	'@clayui/color-picker',
	'@clayui/css',
	'@clayui/data-provider',
	'@clayui/date-picker',
	'@clayui/drop-down',
	'@clayui/empty-state',
	'@clayui/form',
	'@clayui/icon',
	'@clayui/label',
	'@clayui/layout',
	'@clayui/link',
	'@clayui/list',
	'@clayui/loading-indicator',
	'@clayui/management-toolbar',
	'@clayui/modal',
	'@clayui/multi-select',
	'@clayui/multi-step-nav',
	'@clayui/nav',
	'@clayui/navigation-bar',
	'@clayui/pagination',
	'@clayui/pagination-bar',
	'@clayui/panel',
	'@clayui/popover',
	'@clayui/progress-bar',
	'@clayui/shared',
	'@clayui/slider',
	'@clayui/sticker',
	'@clayui/table',
	'@clayui/tabs',
	'@clayui/time-picker',
	'@clayui/tooltip',
	'@clayui/upper-toolbar',
	'classnames',
	'clay',
	'clay-alert',
	'clay-autocomplete',
	'clay-badge',
	'clay-button',
	'clay-card',
	'clay-card-grid',
	'clay-checkbox',
	'clay-collapse',
	'clay-component',
	'clay-data-provider',
	'clay-dataset-display',
	'clay-dropdown',
	'clay-icon',
	'clay-label',
	'clay-link',
	'clay-list',
	'clay-loading-indicator',
	'clay-management-toolbar',
	'clay-modal',
	'clay-multi-select',
	'clay-navigation-bar',
	'clay-pagination',
	'clay-pagination-bar',
	'clay-portal',
	'clay-progress-bar',
	'clay-radio',
	'clay-select',
	'clay-sticker',
	'clay-table',
	'clay-tooltip',
	'formik',
	'incremental-dom',
	'incremental-dom-string',
	'lodash.escape',
	'lodash.groupby',
	'lodash.isequal',
	'lodash.memoize',
	'lodash.unescape',
	'metal',
	'metal-affix',
	'metal-ajax',
	'metal-anim',
	'metal-aop',
	'metal-assertions',
	'metal-clipboard',
	'metal-component',
	'metal-debounce',
	'metal-dom',
	'metal-drag-drop',
	'metal-events',
	'metal-incremental-dom',
	'metal-jsx',
	'metal-key',
	'metal-keyboard-focus',
	'metal-multimap',
	'metal-pagination',
	'metal-path-parser',
	'metal-position',
	'metal-promise',
	'metal-router',
	'metal-scrollspy',
	'metal-soy',
	'metal-soy-bundle',
	'metal-state',
	'metal-storage',
	'metal-structs',
	'metal-throttle',
	'metal-toggler',
	'metal-uri',
	'metal-useragent',
	'metal-web-component',
	'prop-types',
	'querystring',
	'react',
	'react-dnd',
	'react-dnd-html5-backend',
	'react-dom',
	'svg4everybody',
	'uuid',
	'xss-filters',
];

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
					...transformExposes(exposes, build.input),
					'.': mainFilePath,
				},
				filename: 'container.js',
				library: {
					name: `window[Symbol.for("__LIFERAY_WEBPACK_CONTAINERS__")]["${name}"]`,
					type: 'assign',
				},
				name,
				remoteType: 'script',
				remotes: [...DEFAULT_REMOTES, ...remotes].reduce(
					(remotes, name) => {
						remotes[
							name
						] = `window[Symbol.for("__LIFERAY_WEBPACK_CONTAINERS__")]["${name}"]@/o/${name}/__generated__/container.js`;

						return remotes;
					},
					{}
				),
				shared: [...DEFAULT_SHARED, ...shared].reduce(
					(shared, name) => {
						shared[name] = {singleton: true};

						return shared;
					},
					{}
				),
			}),
		],
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
