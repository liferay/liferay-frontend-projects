'use strict';

var livereload = require('gulp-livereload');
var path = require('path');

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	var pathBuild = options.pathBuild;
	var pathSrc = options.pathSrc;

	var argv = options.argv;

	var fullDeploy = (argv.full || argv.f);

	var runSequence = require('run-sequence').use(gulp);

	var staticFileDirs = ['images', 'js'];

	gulp.task('watch', function() {
		clearChangedFile();

		livereload.listen();

		gulp.watch(path.join(pathSrc, '**/*'), function(vinyl) {
			store.set('changedFile', vinyl);

			var relativeFilePath = path.relative(path.join(process.cwd(), pathSrc), vinyl.path);

			var fileExt = path.extname(relativeFilePath);

			var match = relativeFilePath.match(/(.+?)\//);

			var rootDir = match ? match[1] : '';

			var taskArray = ['deploy'];

			if (!fullDeploy && store.get('deployed')) {
				if (staticFileDirs.indexOf(rootDir) > -1) {
					taskArray = ['deploy:file'];
				}
				else if (rootDir == 'WEB-INF') {
					taskArray = ['build:clean', 'build:src', 'build:web-inf', 'deploy:folder'];
				}
				else if (rootDir == 'templates') {
					taskArray = ['build:themelet-js', 'build:themelet-js-inject', 'deploy:folder'];
				}
				else if (rootDir == 'css') {
					taskArray = [
						'build:clean',
						'build:base',
						'build:src',
						'build:themelets',
						'build:themelet-css',
						'build:themelet-css-inject',
						'build:rename-css-dir',
						'build:prep-css',
						'build:compile-css',
						'build:move-compiled-css',
						'build:remove-old-css-dir',
						'deploy:css-files'
					];
				}
			}

			taskArray.push(clearChangedFile);

			runSequence.apply(this, taskArray);
		});
	});

	function clearChangedFile() {
		store.set('changedFile');
	}
};