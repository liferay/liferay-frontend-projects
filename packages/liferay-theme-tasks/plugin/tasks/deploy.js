/**
 * © 2017 Liferay, Inc. <https://liferay.com>
 *
 * SPDX-License-Identifier: MIT
 */

'use strict';

var gutil = require('gulp-util');
var path = require('path');

var TASK_BUILD = 'build';

var TASK_PLUGIN_DEPLOY = 'plugin:deploy';

module.exports = function(options) {
	var gulp = options.gulp;

	var runSequence = require('run-sequence').use(gulp);

	var store = gulp.storage;

	gulp.task(TASK_PLUGIN_DEPLOY, function() {
		var deployPath = store.get('deployPath');

		var stream = gulp
			.src(path.join(options.pathDist, options.distName + '.war'))
			.pipe(gulp.dest(deployPath));

		gutil.log('Deploying to ' + gutil.colors.cyan(deployPath));

		stream.on('end', function() {
			store.set('deployed', true);
		});

		return stream;
	});

	gulp.task('deploy', function(cb) {
		runSequence(TASK_BUILD, TASK_PLUGIN_DEPLOY, cb);
	});
};
