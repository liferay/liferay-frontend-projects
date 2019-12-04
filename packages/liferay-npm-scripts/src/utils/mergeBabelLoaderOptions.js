/**
 * © 2019 Liferay, Inc. <https://liferay.com>
 *
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

	webpackConfig.module.rules.forEach(rule => {
		let {use} = rule;

		if (!use) {
			return;
		}

		if (!Array.isArray(use)) {
			use = [use];
		}

		use.forEach((useEntry, i) => {
			if (typeof useEntry === 'string') {
				use[i] = {
					loader: useEntry,
					options: {...BABEL_CONFIG}
				};
			} else {
				use[i].options = {...BABEL_CONFIG, ...useEntry.options};
			}
		});
	});

	return webpackConfig;
}

module.exports = mergeBabelLoaderOptions;
