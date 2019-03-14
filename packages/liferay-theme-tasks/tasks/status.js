/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

const lfrThemeConfig = require('../lib/liferay_theme_config');
const status = require('../lib/status');

function getStatus(options) {
	const gulp = options.gulp;

	gulp.task('status', function(cb) {
		process.stdout.write(status(lfrThemeConfig.getConfig()));

		cb();
	});
}

module.exports = getStatus;
