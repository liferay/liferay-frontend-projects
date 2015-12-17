'use strict';

var argv = require('minimist')(process.argv.slice(2));
var livereload = require('gulp-livereload');

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	var fullDeploy = (argv.full || argv.f);

	var runSequence = require('run-sequence').use(gulp);

	gulp.task('watch', function() {
		clearChangedFile();

		livereload.listen();

		gulp.watch('src/**/*', function(vinyl) {
			store.set('changedFile', vinyl);

			if (!fullDeploy && store.get('deployed')) {
				runSequence(
					'build:clean',
					'build:base',
					'build:src',
					'build:web-inf',
					'build:themelets',
					'build:rename-css-dir',
					'build:compile-css',
					'build:move-compiled-css',
					'build:remove-old-css-dir',
					'deploy:fast',
					clearChangedFile
				);
			}
			else {
				runSequence('deploy', clearChangedFile);
			}
		});
	});

	function clearChangedFile() {
		store.set('changedFile');
	}
};