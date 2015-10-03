'use strict';

var argv = require('minimist')(process.argv.slice(2));

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	var fullDeploy = (argv.full || argv.f);

	var runSequence = require('run-sequence').use(gulp);

	gulp.task('watch', function() {
		gulp.watch('src/**/*', function(vinyl) {
			store.set('changedFile', vinyl);

			if (!fullDeploy && store.get('deployed')) {
				runSequence(
					'build:base',
					'build:src',
					'build:web-inf',
					'build:rename-css-dir',
					'compile-scss',
					'build:move-compiled-css',
					'build:remove-old-css-dir',
					'deploy:fast',
					function() {
						store.set('changedFile');
					}
				);
			}
			else {
				runSequence('deploy', function() {
					store.set('changedFile');
				});
			}
		});
	});
};