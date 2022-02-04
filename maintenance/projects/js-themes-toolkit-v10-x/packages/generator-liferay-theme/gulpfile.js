/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

var gulp = require('gulp');
var coveralls = require('gulp-coveralls');

gulp.task('coveralls', () => {
	gulp.src('coverage/**/lcov.info').pipe(coveralls());
});
