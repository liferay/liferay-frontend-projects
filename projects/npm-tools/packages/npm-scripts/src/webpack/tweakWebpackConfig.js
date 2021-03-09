/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs');

const createTempFile = require('../utils/createTempFile');
const getMergedConfig = require('../utils/getMergedConfig');
const createFederationConfig = require('./createFederationConfig');

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

	if (federation && federation.mode !== 'disabled') {
		arrayConfig.push(await createFederationConfig());
	}

	arrayConfig = arrayConfig.map((webpackConfig) =>
		mergeBabelLoaderOptions(webpackConfig)
	);

	createTempFile(
		'webpack.config.json',
		JSON.stringify(arrayConfig, null, '\t'),
		{autoDelete: false}
	);

	return arrayConfig.length === 1 ? arrayConfig[0] : arrayConfig;
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

module.exports = tweakWebpackConfig;
