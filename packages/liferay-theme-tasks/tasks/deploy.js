'use strict';

var _ = require('lodash');
var fs = require('fs-extra');
var path = require('path');
var plugins = require('gulp-load-plugins')();
var themeUtil = require('../lib/util');

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	var pathBuild = options.pathBuild;

	var runSequence = require('run-sequence').use(gulp);

	gulp.task('deploy', function(cb) {
		runSequence(
			'build',
			'deploy:war',
			cb
		);
	});

	gulp.task('deploy:fast', function() {
		var dest = store.get('appServerPathTheme');

		var tempDirPath = path.join(dest, '../../temp/');

		var tempThemeDir;

		if (fs.existsSync(tempDirPath) && fs.statSync(tempDirPath).isDirectory()) {
			var themeName = store.get('themeName');

			var tempDir = fs.readdirSync(tempDirPath);

			tempThemeDir = _.find(tempDir, function(fileName) {
				return fileName.indexOf(themeName) > -1;
			});
		}

		var stream = gulp.src(themeUtil.getSrcPath(pathBuild + '/**/*', {
				changedFile: store.get('changedFile'),
				deployed: store.get('deployed')
			}))
			// .pipe(plugins.debug())
			.pipe(gulp.dest(dest));

		if (tempThemeDir) {
			stream.pipe(gulp.dest(path.join(tempDirPath, tempThemeDir)));
		}

		return stream;
	});

	gulp.task('deploy:war', function() {
		var stream = gulp.src('./dist/*.war')
			.pipe(gulp.dest(store.get('deployPath')));

		if (!store.get('deployed')) {
			stream.on('end', function() {
				store.set('deployed', true);
			});
		}

		return stream;
	});
}