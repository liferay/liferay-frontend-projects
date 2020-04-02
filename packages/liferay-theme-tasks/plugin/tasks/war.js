/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

var zip = require('gulp-zip');
var path = require('path');

const project = require('../../lib/project');

module.exports = function() {
	const {gulp} = project;
	const {runSequence} = gulp;

	gulp.task('plugin:war', () => {
		const {options} = project;

		return gulp
			.src(path.join(options.rootDir, '**/*'))
			.pipe(zip(options.distName + '.war'))
			.pipe(gulp.dest(options.pathDist));
	});

	gulp.task('build', done => {
		runSequence('plugin:version', 'plugin:war', done);
	});
};
