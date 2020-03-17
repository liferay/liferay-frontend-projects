/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

'use strict';

const gutil = require('gulp-util');
const path = require('path');

const project = require('../../lib/project');

module.exports = function() {
	const {gulp, store} = project;
	const {runSequence} = gulp;

	gulp.task('plugin:deploy', () => {
		const {options} = project;
		const deployPath = store.get('deployPath');

		const stream = gulp
			.src(path.join(options.pathDist, options.distName + '.war'))
			.pipe(gulp.dest(deployPath));

		gutil.log('Deploying to ' + gutil.colors.cyan(deployPath));

		stream.on('end', () => {
			store.set('deployed', true);
		});

		return stream;
	});

	gulp.task('deploy', cb => {
		runSequence(gulp, 'build', 'plugin:deploy', cb);
	});
};
