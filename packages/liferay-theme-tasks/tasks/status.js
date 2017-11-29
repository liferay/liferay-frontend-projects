'use strict';

let lfrThemeConfig = require('../lib/liferay_theme_config');
let status = require('../lib/status');

module.exports = function(options) {
	let gulp = options.gulp;

	gulp.task('status', function(cb) {
		process.stdout.write(status(lfrThemeConfig.getConfig()));

		cb();
	});
};
