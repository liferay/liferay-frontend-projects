'use strict';

var beautify = require('gulp-beautify');
var concat = require('gulp-concat');
var del = require('del');
var es6to5 = require('gulp-6to5');
var exec = require('child_process').exec;
var fs = require('fs');
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var jsdoc = require('gulp-jsdoc');
var jshint = require('gulp-jshint');
var merge = require('merge-stream');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var template = require('gulp-template');
var uglify = require('gulp-uglify');

gulp.task('build', function(callback) {
    runSequence('clean', ['config', 'loader-min', 'source-min', 'modules', 'lint', 'demo'], 'build-config', callback);
});

gulp.task('build-config', function(callback) {
    exec('node config-generator.js -c src/config/config-base.json -o src/config/config.js dist/demo/modules', function (err, stdout, stderr) {
        callback(err);
    });
});

gulp.task('clean', function (callback) {
    del(['dist'], callback);
});

gulp.task('create-loader-pure', function() {
    var loaderPureContent = fs.readFileSync('dist/loader-pure.js');

    fs.unlinkSync('dist/loader-pure.js');

    return gulp.src('src/template/loader-pure.template')
        .pipe(template({
            vendor: '',
            source: loaderPureContent
        }))
        .pipe(rename('loader-pure.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('combine-js', ['wrap-event-emitter', 'wrap-config-parser', 'wrap-dependency-builder', 'wrap-url-builder', 'wrap-script-loader'], function(callback) {
    runSequence('wrap-js-files', 'create-loader-pure', callback);
});

gulp.task('config', function() {
    return gulp.src('src/config/**/*.*')
        .pipe(gulp.dest('dist/demo/config'));
});

gulp.task('default', ['build']);

gulp.task('demo', function() {
    return gulp.src('src/demo/**/*.*')
        .pipe(gulp.dest('dist/demo'));
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

gulp.task('js', ['jsdoc', 'combine-js'], function() {
    return gulp.src('src/template/loader.template')
        .pipe(template({
            vendor: fs.readFileSync('src/vendor/promise.js'),
            source: fs.readFileSync('dist/loader-pure.js')
        }))
        .pipe(rename('loader.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('jsdoc', function() {
    gulp.src(['./src/js/**/*.js', 'README.md'])
        .pipe(jsdoc('api'));
});

gulp.task('lint', function() {
  return gulp.src(['src/js/**/*.js', 'test/**/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter(require('jshint-stylish')));
});

gulp.task('loader-min', ['js'], function() {
    return gulp.src('dist/loader.js')
        .pipe(uglify())
        .pipe(rename('loader-min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('modules', function() {
    return gulp.src('src/modules/**/*.*')
        .pipe(es6to5({
            'modules': 'amd',
            'moduleIds': true
        }))
        .pipe(gulp.dest('dist/demo/modules'));
});

gulp.task('test', ['build'], function(done) {
    gulp.src(['umd/**/*.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', function () {
            gulp.src(['test/**/*.js', '!test/fixture/**/*.js'])
                .pipe(mocha())
                .pipe(istanbul.writeReports())
                .on('end', done);
            });
});

gulp.task('test-watch', function() {
    gulp.watch('tests/js/**/*.js', ['test']);
});

gulp.task('source-min', ['js'], function() {
    return gulp.src('dist/loader-pure.js')
        .pipe(uglify())
        .pipe(rename('loader-pure-min.js'))
        .pipe(gulp.dest('dist'));
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
        .pipe(gulp.dest('umd'));
});

gulp.task('wrap-event-emitter', function() {
    return gulp.src('src/template/event-emitter.template')
        .pipe(template({
            source: fs.readFileSync('src/js/event-emitter.js')
        }))
        .pipe(rename('event-emitter.js'))
        .pipe(gulp.dest('umd'));
});

gulp.task('wrap-dependency-builder', function() {
    return gulp.src('src/template/dependency-builder.template')
        .pipe(template({
            source: fs.readFileSync('src/js/dependency-builder.js')
        }))
        .pipe(rename('dependency-builder.js'))
        .pipe(gulp.dest('umd'));
});

gulp.task('wrap-js-files', function() {
    return gulp.src([
        'umd/event-emitter.js',
        'umd/config-parser.js',
        'umd/dependency-builder.js',
        'umd/url-builder.js',
        'umd/script-loader.js',
        ])
    .pipe(concat('loader-pure.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('wrap-script-loader', function() {
    return gulp.src('src/template/script-loader.template')
        .pipe(template({
            source: fs.readFileSync('src/js/script-loader.js')
        }))
        .pipe(rename('script-loader.js'))
        .pipe(gulp.dest('umd'));
});

gulp.task('wrap-url-builder', function() {
    return gulp.src('src/template/url-builder.template')
        .pipe(template({
            source: fs.readFileSync('src/js/url-builder.js')
        }))
        .pipe(rename('url-builder.js'))
        .pipe(gulp.dest('umd'));
});