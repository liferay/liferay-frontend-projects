'use strict';

var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var mocha = require('gulp-mocha');

gulp.task('pre-test', function () {
	return gulp.src(['generators/**/index.js'])
		.pipe(istanbul())
		.pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
	return gulp.src(['test/unit/*.js', 'test/functional/*.js'])
		.pipe(mocha({
			timeout: 4000
		}))
		.pipe(istanbul.writeReports());
});

gulp.run('test');
