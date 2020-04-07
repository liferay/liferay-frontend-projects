/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const gutil = require('gulp-util');

const project = require('../../lib/project');

module.exports = function() {
	const {gulp, store} = project;
	const {runSequence} = gulp;

	gulp.task('plugin:deploy', () => {
		const {options} = project;
		const {deployPath} = store;

		const stream = gulp
			.src(options.pathDist.join(options.distName + '.war').asPosix)
			.pipe(gulp.dest(deployPath.asNative));

		gutil.log('Deploying to ' + gutil.colors.cyan(deployPath.asNative));

		stream.on('end', () => {
			store.deployed = true;
		});

		return stream;
	});

	gulp.task('deploy', cb => {
		runSequence('build', 'plugin:deploy', cb);
	});
};
