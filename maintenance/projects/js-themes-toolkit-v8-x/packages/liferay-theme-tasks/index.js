/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const globby = require('globby');
const loadPlugins = require('gulp-load-plugins');
const liferayPluginTasks = require('liferay-plugin-node-tasks');
const _ = require('lodash');
const path = require('path');

const check = require('./lib/checkNodeVersion');
const {doctor} = require('./lib/doctor');
const lfrThemeConfig = require('./lib/liferay_theme_config');

check();

const plugins = loadPlugins();

const themeConfig = lfrThemeConfig.getConfig();

module.exports.registerTasks = function (options) {
	options = require('./lib/options')(options);

	liferayPluginTasks.registerTasks(
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
};

function register(options) {
	let gulp = options.gulp;

	gulp = options.gulp = plugins.help(gulp);

	const store = gulp.storage;

	store.set('changedFile');

	globby.sync([path.resolve(__dirname, 'tasks/**/*')]).forEach((item) => {
		if (item.indexOf('__tests__') === -1) {
			// eslint-disable-next-line @liferay/no-dynamic-require
			require(item)(options);
		}
	});

	const haltOnMissingDeps = !!_.intersection(
		['build', 'deploy', 'watch'],
		options.argv._
	).length;

	const tasks = options.insideTests ? [] : options.argv._;

	doctor({haltOnMissingDeps, tasks});
}
