'use strict';

var _ = require('lodash');
var globby = require('globby');
var liferayPluginTasks = require('liferay-plugin-node-tasks');
var path = require('path');
var plugins = require('gulp-load-plugins')();

var doctor = require('./lib/doctor');
var lfrThemeConfig = require('./lib/liferay_theme_config');
var versionControl = require('./lib/version_control.js');

var themeConfig = lfrThemeConfig.getConfig();

module.exports.registerTasks = function(options) {
	options = require('./lib/options')(options);

	liferayPluginTasks.registerTasks(_.defaults({
		extensions: register,
		hookFn: options.hookFn,
		hookModules: themeConfig ? themeConfig.hookModules : null,
		rootDir: options.pathBuild,
		storeConfig: {
			name: 'LiferayTheme',
			path: 'liferay-theme.json'
		}
	}, options));
};

function register(options) {
	var gulp = options.gulp;

	gulp = options.gulp = plugins.help(gulp);

	var store = gulp.storage;

	store.set('changedFile');

	globby.sync(path.resolve(__dirname, 'tasks/**/*')).forEach(function(item) {
		require(item)(options);
	});

	var halt = _.intersection(['build', 'deploy', 'watch'], options.argv._).length > 0;

	doctor(null, halt);

	if (!options.argv['skip-update-check']) {
		process.once('beforeExit', function() {
			versionControl();
		});
	}
}
