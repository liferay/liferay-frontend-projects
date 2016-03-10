'use strict';

var _ = require('lodash');
var async = require('async');
var doctor = require('./lib/doctor');
var glob = require('glob');
var lfrThemeConfig = require('./lib/liferay_theme_config');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var RegisterHooks = require('./lib/register_hooks');
var versionControl = require('./lib/version_control.js');

var gutil = plugins.util;

var themeConfig = lfrThemeConfig.getConfig();

module.exports.registerTasks = function(options) {
	options = require('./lib/options')(options);

	var gulp = options.gulp;

	gulp.tasks = {};

	RegisterHooks.hook(gulp, {
		hookFn: options.hookFn,
		hookModules: themeConfig ? themeConfig.hookModules : null
	});

	gulp = options.gulp = plugins.help(gulp);

	plugins.storage(gulp);

	var store = gulp.storage;

	store.create('LiferayTheme', 'liferay-theme.json');

	store.set('changedFile');

	glob.sync(path.resolve(__dirname, 'tasks/**/*')).forEach(function(item, index) {
		require(item)(options);
	});

	var halt = _.intersection(['build', 'deploy', 'watch'], options.argv._).length > 0;

	doctor(null, halt);

	process.once('beforeExit', function() {
		versionControl();
	});
};
