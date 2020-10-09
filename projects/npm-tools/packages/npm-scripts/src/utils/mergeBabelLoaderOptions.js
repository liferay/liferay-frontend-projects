/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

const getMergedConfig = require('./getMergedConfig');

const BABEL_CONFIG = getMergedConfig('babel');

/**
 * Modify all babel-loader options so that they include our defaults.
 *
 * @param {object} webpackConfig
 * the object which has been exported from the webpack.config.js file
 */
function mergeBabelLoaderOptions(webpackConfig) {
	if (!webpackConfig.module) {
		return webpackConfig;
	}

	if (!webpackConfig.module.rules) {
		return webpackConfig;
	}

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
							options: {...BABEL_CONFIG},
						};
					}
					else if (useEntry.loader === 'babel-loader') {
						return {
							...useEntry,
							options: {...BABEL_CONFIG, ...useEntry.options},
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

module.exports = mergeBabelLoaderOptions;
