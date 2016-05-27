'use strict';

var lfrThemeConfig = require('../lib/liferay_theme_config');
var status = require('../lib/status');

module.exports = function(options) {
	var gulp = options.gulp;

	gulp.task('status', function(cb) {
		process.stdout.write(status(lfrThemeConfig.getConfig()));

		cb();
	});
};
