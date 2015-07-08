'use strict';

var beautify = require('gulp-beautify');
var concat = require('gulp-concat');
var del = require('del');
var babel = require('gulp-babel');
var exec = require('child_process').exec;
var fs = require('fs');
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var jsdoc = require('gulp-jsdoc');
var merge = require('merge-stream');
var mocha = require('gulp-mocha');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var template = require('gulp-template');
var uglify = require('gulp-uglify');

gulp.task('build', function(callback) {
    runSequence('clean', ['config', 'loader-min', 'source-min', 'modules'], 'build-config', 'demo', callback);
});

gulp.task('build-config', function(callback) {
    exec('node node_modules/lfr-module-config-generator/bin/index.js -b src/config/config-base.js -m dist/demo/modules/bower.json -o src/config/config.js -r dist/demo/modules dist/demo/modules', function(err, stdout, stderr) {
        if (err) {
            console.error(err);
        }

        console.log(stdout);
        console.log(stderr);

        callback(err);
    });
});

gulp.task('clean', function(callback) {
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

gulp.task('combine-js', ['wrap-event-emitter', 'wrap-config-parser', 'wrap-dependency-builder', 'wrap-path-resolver', 'wrap-url-builder', 'wrap-script-loader'], function(callback) {
    runSequence('wrap-js-files', 'create-loader-pure', callback);
});

gulp.task('config', function() {
    return gulp.src('src/config/**/*.*')
        .pipe(gulp.dest('dist/demo/config'));
});

gulp.task('copy-bower', function() {
    return gulp.src('src/modules/bower.json')
        .pipe(gulp.dest('dist/demo/modules'));
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

gulp.task('loader-min', ['js'], function() {
    return gulp.src('dist/loader.js')
        .pipe(uglify())
        .pipe(rename('loader-min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('modules2', function() {
    return gulp.src('src/modules2/**/*.js')
        .pipe(gulp.dest('dist/demo/modules2'));
});

gulp.task('modules', ['copy-bower', 'modules2'], function() {
    return gulp.src('src/modules/**/*.js')
        .pipe(babel({
            'modules': 'amd',
            'moduleIds': false
        }))
        .pipe(gulp.dest('dist/demo/modules'));
});

gulp.task('test', ['build'], function(done) {
    gulp.src(['umd/**/*.js'])
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            gulp.src(['test/**/*.js', '!test/fixture/**/*.js'])
                .pipe(mocha())
                .pipe(istanbul.writeReports())
                .on('end', done);
        });
});

gulp.task('test:no-coverage', ['build'], function() {
    return gulp.src([
        'umd/**/*.js',
        'test/**/*.js',
        '!test/fixture/**/*.js'
        ])
        .pipe(mocha());
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

gulp.task('watch', ['build'], function () {
    gulp.watch(['src/**/*', '!src/config/*'], ['build']);
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
            'umd/path-resolver.js',
            'umd/script-loader.js'
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

gulp.task('wrap-path-resolver', function() {
    return gulp.src('src/template/path-resolver.template')
        .pipe(template({
            source: fs.readFileSync('src/js/path-resolver.js')
        }))
        .pipe(rename('path-resolver.js'))
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