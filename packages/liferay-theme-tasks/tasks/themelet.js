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
			return gulp.src(getThemeletSrcPaths(store.get('themeletDependencies'), '.+(css|scss)'))
				// .pipe(plugins.debug())
				.pipe(plugins.concat('themelet.css'))
				.pipe(gulp.dest(path.join(pathBuild, 'css')));
		}
	);

	gulp.task(
		'build:themelet-images',
		function(cb) {
			runThemeletDependenciesSeries(store.get('themeletDependencies'), function(item, index, done) {
				gulp.src(path.resolve(cwd, 'node_modules', index, 'src/images/*'))
					// .pipe(plugins.debug())
					.pipe(gulp.dest(path.join(pathBuild, 'images', index)))
					.on('end', done);
			}, cb);
		}
	);

	gulp.task(
		'build:themelet-js',
		function(cb) {
			runThemeletDependenciesSeries(store.get('themeletDependencies'), function(item, index, done) {
				gulp.src(path.resolve(cwd, 'node_modules', index, 'src/js/*+(.js)'))
					// .pipe(plugins.debug())
					.pipe(gulp.dest(path.join(pathBuild, 'js', index)))
					.on('end', done);
			}, cb);
		}
	);

	gulp.task(
		'build:themelet-templates',
		function(cb) {
			runThemeletDependenciesSeries(store.get('themeletDependencies'), function(item, index, done) {
				gulp.src(path.resolve(cwd, 'node_modules', index, 'src/templates/*+(.ftl|.vm)'))
					// .pipe(plugins.debug())
					.pipe(gulp.dest(path.join(pathBuild, 'templates', index)))
					.on('end', done);
			}, cb);
		}
	);
}

function getThemeletSrcPaths(themeletDependencies, fileTypes) {
	var cwd = process.cwd();

	var srcFiles = 'src/**/*';

	if (fileTypes) {
		srcFiles += fileTypes
	}

	var themeSrcPaths = _.map(themeletDependencies, function(item, index) {
		return path.resolve(cwd, 'node_modules', index, srcFiles);
	});

	return themeSrcPaths;
}

function runThemeletDependenciesSeries(themeletDependencies, asyncTask, cb) {
	var cwd = process.cwd();

	var themeletStreamMap = _.map(themeletDependencies, function(item, index) {
		return _.bind(asyncTask, this, item, index);
	});

	async.series(themeletStreamMap, cb);
}
