/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

module.exports = function(gulp) {
	gulp.hook('after:build', cb => {
		cb();
	});
};
