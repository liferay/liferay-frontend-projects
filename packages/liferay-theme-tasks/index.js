'use strict';

const _ = require('lodash');
const globby = require('globby');
const liferayPluginTasks = require('liferay-plugin-node-tasks');
const path = require('path');
const plugins = require('gulp-load-plugins')();

const {doctor} = require('./lib/doctor');
const lfrThemeConfig = require('./lib/liferay_theme_config');
const versionControl = require('./lib/version_control.js');

const themeConfig = lfrThemeConfig.getConfig();

module.exports.registerTasks = function(options) {
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

	let store = gulp.storage;

	store.set('changedFile');

	globby.sync(path.resolve(__dirname, 'tasks/**/*')).forEach(function(item) {
		require(item)(options);
	});

	let haltOnMissingDeps =
		_.intersection(['build', 'deploy', 'watch'], options.argv._).length > 0;

	const tasks = options.insideTests ? [] : options.argv._;

	doctor({haltOnMissingDeps, tasks});

	if (!options.argv['skip-update-check']) {
		process.once('beforeExit', function() {
			versionControl();
		});
	}
}
