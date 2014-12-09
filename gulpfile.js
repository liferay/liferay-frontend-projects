'use strict';

var beautify = require('gulp-beautify');
var concat = require('gulp-concat');
var del = require('del');
var es6ModuleTranspiler = require('gulp-es6-module-transpiler');
var exec = require('child_process').exec;
var fs = require('fs');
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var istanbul = require('gulp-istanbul');
var jshint = require('gulp-jshint');
var merge = require('merge-stream');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var template = require('gulp-template');
var uglify = require('gulp-uglify');

gulp.task('build', function(callback) {
    runSequence('clean', ['config', 'loader-min', 'source-min', 'modules', 'build-config', 'vendor', 'lint', 'demo'], callback);
});

gulp.task('build-config', function(callback) {
    exec('node config-generator.js -c src/config/config-base.json -o src/config/config.js src/modules', function (err, stdout, stderr) {
        callback(err);
    });
});

gulp.task('clean', function (callback) {
    del(['dist'], callback);
});

gulp.task('combine-js', ['wrap-path-resolver', 'wrap-event-emitter', 'wrap-config-parser', 'wrap-dependency-builder', 'wrap-url-builder', 'wrap-script-loader'], function() {
    return gulp.src([
        'dist/source/path-resolver.js',
        'dist/source/event-emitter.js',
        'dist/source/config-parser.js',
        'dist/source/dependency-builder.js',
        'dist/source/url-builder.js',
        'dist/source/script-loader.js',
        ])
    .pipe(concat('source.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('config', function() {
    return gulp.src('src/config/**/*.*')
        .pipe(gulp.dest('dist/config'));
});

gulp.task('default', function(callback) {
    runSequence('build', callback);
});

gulp.task('demo', function() {
    return gulp.src('src/demo/**/*.*')
        .pipe(gulp.dest('dist'));
});

gulp.task('format', function() {
    var src = gulp.src(['src/**/*.js'])
        .pipe(beautify())
        .pipe(gulp.dest('src'));

    var test = gulp.src(['test/**/*.js'])
        .pipe(beautify())
        .pipe(gulp.dest('test'));

    return merge(src, test);
});

gulp.task('js', ['combine-js', 'vendor-js'], function() {
    return gulp.src('src/template/loader.template')
        .pipe(template({
            vendor: fs.readFileSync('dist/js/vendor.js'),
            source: fs.readFileSync('dist/js/source.js')
        }))
        .pipe(rename('loader.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('lint', function() {
  return gulp.src(['src/js/**/*.js', 'test/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(require('jshint-stylish')));
});

gulp.task('loader-min', ['js'], function() {
    return gulp.src('dist/js/loader.js')
        .pipe(uglify())
        .pipe(rename('loader-min.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('modules', function() {
    return gulp.src('src/modules/**/*.*')
        .pipe(es6ModuleTranspiler({
            type: 'amd'
        }))
        .pipe(gulp.dest('dist/modules'));
});

gulp.task('test', function() {
  return gulp.src(['test/**/*.js', '!test/fixture/**/*.js'])
    .pipe(mocha());
});

gulp.task('test-cover', function() {
    return gulp.src(['dist/source/**/*.js'])
        .pipe(istanbul());
});

gulp.task('test-coverage', ['test-cover'], function() {
    return gulp.src(['test/**/*.js', '!test/fixture/**/*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports());
});

gulp.task('test-watch', function() {
    gulp.watch('tests/js/**/*.js', ['test']);
});

gulp.task('source-min', ['js'], function() {
    return gulp.src('dist/js/source.js')
        .pipe(uglify())
        .pipe(rename('source-min.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('vendor', function() {
    return gulp.src('src/vendor/**/*.*')
        .pipe(gulp.dest('dist/vendor'));
});

gulp.task('vendor-js', function() {
    return gulp.src([
        'src/vendor/promise.js',
        ])
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest('dist/js'));
});

gulp.task('watch', ['build'], function() {
    gulp.watch('src/**/*', ['build']);
});

gulp.task('wrap-config-parser', function() {
    return gulp.src('src/template/config-parser.template')
        .pipe(template({
            source: fs.readFileSync('src/js/config-parser.js')
        }))
        .pipe(rename('config-parser.js'))
        .pipe(gulp.dest('dist/source'));
});

gulp.task('wrap-event-emitter', function() {
    return gulp.src('src/template/event-emitter.template')
        .pipe(template({
            source: fs.readFileSync('src/js/event-emitter.js')
        }))
        .pipe(rename('event-emitter.js'))
        .pipe(gulp.dest('dist/source'));
});

gulp.task('wrap-dependency-builder', function() {
    return gulp.src('src/template/dependency-builder.template')
        .pipe(template({
            source: fs.readFileSync('src/js/dependency-builder.js')
        }))
        .pipe(rename('dependency-builder.js'))
        .pipe(gulp.dest('dist/source'));
});

gulp.task('wrap-path-resolver', function() {
    return gulp.src('src/template/path-resolver.template')
        .pipe(template({
            source: fs.readFileSync('src/js/path-resolver.js')
        }))
        .pipe(rename('path-resolver.js'))
        .pipe(gulp.dest('dist/source'));
});

gulp.task('wrap-script-loader', function() {
    return gulp.src('src/template/script-loader.template')
        .pipe(template({
            source: fs.readFileSync('src/js/script-loader.js')
        }))
        .pipe(rename('script-loader.js'))
        .pipe(gulp.dest('dist/source'));
});

gulp.task('wrap-url-builder', function() {
    return gulp.src('src/template/url-builder.template')
        .pipe(template({
            source: fs.readFileSync('src/js/url-builder.js')
        }))
        .pipe(rename('url-builder.js'))
        .pipe(gulp.dest('dist/source'));
});