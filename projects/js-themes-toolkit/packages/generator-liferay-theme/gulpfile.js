/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const gulp = require('gulp');
const coveralls = require('gulp-coveralls');

gulp.task('coveralls', () => {
	gulp.src('coverage/**/lcov.info').pipe(coveralls());
});
