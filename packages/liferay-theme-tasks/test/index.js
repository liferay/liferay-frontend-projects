'use strict';

var Gulp = require('gulp').Gulp;
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

var gulp = new Gulp();

var runSequence = require('run-sequence').use(gulp);

gulp.task('pre-test', function () {
	return gulp.src(['lib/**/*.js', 'tasks/**/*.js'])
		.pipe(istanbul())
		.pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
	return gulp.src(['test/lib/**/*.js', 'test/tasks/**/*.js'])
		.pipe(mocha({
			timeout: 4000
		}))
		.pipe(istanbul.writeReports());
});

runSequence('test');
