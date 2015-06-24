'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var async = require('async');
var path = require('path');
var plugins = require('gulp-load-plugins')();

module.exports = function(options) {
	var cwd = process.cwd();

	var gulp = options.gulp;

	var store = gulp.storage;

	var pathBuild = options.pathBuild;

	gulp.task('build:themelets', ['build:themelet-css', 'build:themelet-images', 'build:themelet-js', 'build:themelet-templates']);

	gulp.task(
		'build:themelet-css',
		function() {
			return gulp.src(getThemeletSrcPaths('.+(css|scss)'))
				// .pipe(plugins.debug())
				.pipe(plugins.concat('themelet.css'))
				.pipe(gulp.dest(path.join(pathBuild, 'css')));
		}
	);

	gulp.task(
		'build:themelet-images',
		function(cb) {
			buildStaticThemeletFiles('images', null, cb);
		}
	);

	gulp.task(
		'build:themelet-js',
		function(cb) {
			buildStaticThemeletFiles('js', '.js', cb);
		}
	);

	gulp.task(
		'build:themelet-templates',
		function(cb) {
			buildStaticThemeletFiles('templates', '.+(ftl|vm)', cb);
		}
	);

	function getThemeletSrcPaths(fileTypes) {
		var cwd = process.cwd();

		var srcFiles = 'src/**/*';

		if (fileTypes) {
			srcFiles += fileTypes
		}

		var themeSrcPaths = _.map(store.get('themeletDependencies'), function(item, index) {
			return path.resolve(cwd, 'node_modules', index, srcFiles);
		});

		return themeSrcPaths;
	}

	function buildStaticThemeletFiles(dirName, fileTypes, cb) {
		var srcFiles = '*';

		if (fileTypes) {
			srcFiles += fileTypes;
		}

		runThemeletDependenciesSeries(function(item, index, done) {
			gulp.src(path.resolve(cwd, 'node_modules', index, 'src', dirName, srcFiles))
				//.pipe(plugins.debug())
				.pipe(gulp.dest(path.join(pathBuild, dirName, index)))
				.on('end', done);
		}, cb);
	}

	function runThemeletDependenciesSeries(asyncTask, cb) {
		var cwd = process.cwd();

		var themeletStreamMap = _.map(store.get('themeletDependencies'), function(item, index) {
			return _.bind(asyncTask, this, item, index);
		});

		async.series(themeletStreamMap, cb);
	}
}
