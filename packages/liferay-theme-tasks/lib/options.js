/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const _ = require('lodash');
const {getArgv} = require('./util');

const lfrThemeConfig = require('./liferay_theme_config');

let options;

function getOptions(config) {
	if (!options || config) {
		config = config || {};
		config.argv = getArgv();
		config.pathBuild = config.pathBuild || './build';
		config.pathDist = config.pathDist || './dist';
		config.pathSrc = config.pathSrc || './src';
		config.resourcePrefix = config.resourcePrefix || '/o';
		config.sassOptions = config.sassOptions || {};

		const themeConfig = lfrThemeConfig.getConfig();

		_.assign(config, themeConfig);

		options = config;
	}

	return options;
}

module.exports = getOptions;
