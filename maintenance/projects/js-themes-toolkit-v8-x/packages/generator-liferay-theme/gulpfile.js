/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

var coveralls = require('gulp-coveralls');
var gulp = require('gulp');

gulp.task('coveralls', function () {
	gulp.src('coverage/**/lcov.info').pipe(coveralls());
});
