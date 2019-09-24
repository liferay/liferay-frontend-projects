/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

var zip = require('gulp-zip');
var path = require('path');

var TASK_PLUGIN_WAR = 'plugin:war';

module.exports = function(options) {
	var gulp = options.gulp;

	var runSequence = require('run-sequence').use(gulp);

	gulp.task(TASK_PLUGIN_WAR, () => {
		return gulp
			.src(path.join(options.rootDir, '**/*'))
			.pipe(zip(options.distName + '.war'))
			.pipe(gulp.dest(options.pathDist));
	});

	gulp.task('build', done => {
		runSequence('plugin:version', TASK_PLUGIN_WAR, done);
	});
};
