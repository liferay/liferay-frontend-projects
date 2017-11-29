'use strict';

let _ = require('lodash');
let globby = require('globby');
let liferayPluginTasks = require('liferay-plugin-node-tasks');
let path = require('path');
let plugins = require('gulp-load-plugins')();

let divert = require('./lib/divert');
let lfrThemeConfig = require('./lib/liferay_theme_config');
let versionControl = require('./lib/version_control.js');

let themeConfig = lfrThemeConfig.getConfig();

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

	let halt =
		_.intersection(['build', 'deploy', 'watch'], options.argv._).length > 0;

	divert('doctor').doctor(null, halt);

	if (!options.argv['skip-update-check']) {
		process.once('beforeExit', function() {
			versionControl();
		});
	}
}
