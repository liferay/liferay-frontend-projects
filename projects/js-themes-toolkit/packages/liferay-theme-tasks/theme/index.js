/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const _ = require('lodash');

const checkNodeVersion = require('../lib/checkNodeVersion');
const project = require('../lib/project');
const {getArgv} = require('../lib/util');
const plugin = require('../plugin');
const registerTaskBuild = require('./tasks/build');
const registerTaskBuildCompileCss = require('./tasks/build/compile-css');
const registerTaskBuildThemelets = require('./tasks/build/themelets');
const registerTaskDeploy = require('./tasks/deploy');
const registerTaskExtend = require('./tasks/extend');
const registerTaskInit = require('./tasks/init');
const registerTaskKickstart = require('./tasks/kickstart');
const registerTaskOverwrite = require('./tasks/overwrite');
const registerTaskStatus = require('./tasks/status');
const registerTaskUpgrade = require('./tasks/upgrade');
const registerTaskWatch = require('./tasks/watch');

checkNodeVersion();

function processOptions(options) {
	options = options || {};
	options.argv = getArgv();
	options.pathBuild = options.pathBuild || './build';
	options.pathDist = options.pathDist || './dist';
	options.pathSrc = options.pathSrc || './src';
	options.resourcePrefix = options.resourcePrefix || '/o';
	options.sassOptions = options.sassOptions || {};

	const themeConfig = project.themeConfig.config;

	Object.assign(options, themeConfig);

	return options;
}

function registerTasks(options = {}) {
	options = processOptions(options);

	const themeConfig = project.themeConfig.config;

	plugin.registerTasks(
		_.defaults(
			{
				extensions: register,
				hookFn: options.hookFn,
				hookModules: themeConfig ? themeConfig.hookModules : null,
				rootDir: options.pathBuild,
				storeConfig: {
					name: 'LiferayTheme',
					path: 'liferay-theme.json',
				},
			},
			options
		)
	);
}

function register() {
	project.store.changedFile = undefined;

	registerTaskBuildCompileCss();
	registerTaskBuildThemelets();
	registerTaskBuild();
	registerTaskDeploy();
	registerTaskExtend();
	registerTaskInit();
	registerTaskKickstart();
	registerTaskOverwrite();
	registerTaskStatus();
	registerTaskUpgrade();
	registerTaskWatch();
}

module.exports = {
	registerTasks,
};
