'use strict';

var argv = require('minimist')(process.argv.slice(2));

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	var fullDeploy = (argv.full || argv.f);

	var runSequence = require('run-sequence').use(gulp);

	gulp.task(
		'watch',
		function() {
			gulp.watch(
				'src/**/*',
				function(vinyl) {
					store.set('changedFile', vinyl);

					if (!fullDeploy && store.get('deployed')) {
						runSequence(
							'build:src',
							'build:web-inf',
							'rename-css-dir',
							'compile-scss',
							'move-compiled-css',
							'remove-old-css-dir',
							'deploy:fast',
							function() {
								store.set('changedFile');
							}
						);
					}
					else {
						runSequence(
							'deploy',
							function() {
								store.set('changedFile');
							}
						);
					}
				}
			);
		}
	);
}