'use strict';

var _ = require('lodash');
var async = require('async');
var path = require('path');
var plugins = require('gulp-load-plugins')();

var CWD = process.cwd();

module.exports = function(options) {
	var gulp = options.gulp;

	var pathBuild = options.pathBuild;

	var runSequence = require('run-sequence').use(gulp);

	gulp.task('build:themelets', function(cb) {
		runSequence(
			['build:themelet-css', 'build:themelet-images', 'build:themelet-js', 'build:themelet-templates'],
			'build:themelet-css-inject',
			cb
		);
	});

	gulp.task('build:themelet-css', function(cb) {
		buildStaticThemeletFiles('css', '.+(css|scss)', cb);
	});

	gulp.task('build:themelet-css-inject', function(cb) {
		var themeSrcPaths = path.join(pathBuild, 'css/themelets/**/*.+(css|scss)');

		var sources = gulp.src(themeSrcPaths, {
			read: false
		});

		return gulp.src('build/css/main.css')
			.pipe(plugins.inject(sources, {
				starttag: '/* inject:imports */',
				endtag: '/* endinject */',
				transform: function (filepath) {
					filepath = filepath.replace(/(\/build\/css\/)(.*)/, '$2');

					return '@import url(' + filepath + ');';
				}
			}))
			.pipe(gulp.dest('build/css'));
	});

	gulp.task('build:themelet-images', function(cb) {
		buildStaticThemeletFiles('images', null, cb);
	});

	gulp.task('build:themelet-js', function(cb) {
		buildStaticThemeletFiles('js', '.js', cb);
	});

	gulp.task('build:themelet-templates', function(cb) {
		buildStaticThemeletFiles('templates', '.+(ftl|vm)', cb);
	});

	function getThemeletSrcPaths(fileTypes) {
		var srcFiles = 'src/**/*';

		if (fileTypes) {
			srcFiles += fileTypes;
		}

		var themeSrcPaths = _.map(getThemeletDependencies(), function(item, index) {
			return path.resolve(CWD, 'node_modules', index, srcFiles);
		});

		return themeSrcPaths;
	}

	function buildStaticThemeletFiles(dirName, fileTypes, cb) {
		var srcFiles = '*';

		if (fileTypes) {
			srcFiles += fileTypes;
		}

		runThemeletDependenciesSeries(function(item, index, done) {
			gulp.src(path.resolve(CWD, 'node_modules', index, 'src', dirName, srcFiles))
				.pipe(gulp.dest(path.join(pathBuild, dirName, 'themelets', index)))
				.on('end', done);
		}, cb);
	}

	function runThemeletDependenciesSeries(asyncTask, cb) {
		var themeletStreamMap = _.map(getThemeletDependencies(), function(item, index) {
			return _.bind(asyncTask, this, item, index);
		});

		async.series(themeletStreamMap, cb);
	}
};

function getThemeletDependencies() {
	var packageJSON = require(path.join(CWD, 'package.json'));

	var themeletDependencies;

	if (packageJSON.liferayTheme && packageJSON.liferayTheme.themeletDependencies) {
		themeletDependencies = packageJSON.liferayTheme.themeletDependencies;
	}

	return themeletDependencies;
}