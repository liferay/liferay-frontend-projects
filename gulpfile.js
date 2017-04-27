'use strict';

var babel = require('gulp-babel');
var concat = require('gulp-concat');
var del = require('del');
var exec = require('child_process').exec;
var fs = require('fs');
var gulp = require('gulp');
var istanbul = require('gulp-istanbul');
var jsdoc = require('gulp-jsdoc');
var merge = require('merge-stream');
var mocha = require('gulp-mocha');
var pkg = require('./package.json');
var rename = require('gulp-rename');
var runSequence = require('run-sequence');
var stripDebug = require('gulp-strip-debug');
var template = require('gulp-template');
var uglify = require('gulp-uglify');

gulp.task('build', function(callback) {
    runSequence('clean', 'create-loader-min', 'build-config', 'demo', callback);
});

gulp.task('build-config', ['config', 'modules'], function(callback) {
    exec('node node_modules/liferay-module-config-generator/bin/index.js -b src/config/config-base.js -m dist/demo/modules/bower.json -o src/config/config.js -r dist/demo/modules dist/demo/modules', function(err, stdout, stderr) {
        if (err) {
            console.error(err);
        }

        console.log(stdout);
        console.log(stderr);

        callback(err);
    });
});

gulp.task('clean', function(callback) {
    del(['dist']).then(function() {
       callback();
    });
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

gulp.task('create-loader', ['create-loader-debug'], function() {
    return gulp.src('dist/loader-debug.js')
        .pipe(stripDebug())
        .pipe(rename('loader.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('create-loader-debug', ['create-loader-pure-debug'], function() {
    return gulp.src('src/template/loader.template')
        .pipe(template({
            vendor: fs.readFileSync('node_modules/es6-promise/dist/es6-promise.js').toString(),
            source: fs.readFileSync('dist/loader-pure-debug.js').toString()
        }))
        .pipe(rename('loader-debug.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('create-loader-min', ['create-loader', 'create-loader-pure-min', 'copy-es6promise-map'], function() {
    return gulp.src('dist/loader.js')
        .pipe(uglify())
        .pipe(rename('loader-min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('create-loader-pure-debug', ['create-loader-pure-wrapped'], function() {
    var loaderPureContent = fs.readFileSync('dist/loader-pure-wrapped.js').toString();

    fs.unlinkSync('dist/loader-pure-wrapped.js');

    return gulp.src('src/template/loader-pure.template')
        .pipe(template({
            source: loaderPureContent,
            vendor: '',
            version: pkg.version
        }))
        .pipe(rename('loader-pure-debug.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('create-loader-pure-min', ['create-loader-pure'], function() {
    return gulp.src('dist/loader-pure.js')
        .pipe(uglify())
        .pipe(rename('loader-pure-min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('create-loader-pure', ['create-loader-pure-debug'], function() {
    return gulp.src('dist/loader-pure-debug.js')
        .pipe(stripDebug())
        .pipe(rename('loader-pure.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('create-loader-pure-wrapped', ['jsdoc', 'wrap-event-emitter', 'wrap-config-parser', 'wrap-dependency-builder', 'wrap-path-resolver', 'wrap-url-builder', 'wrap-script-loader'], function() {
    return gulp.src([
            'umd/event-emitter.js',
            'umd/config-parser.js',
            'umd/dependency-builder.js',
            'umd/url-builder.js',
            'umd/path-resolver.js',
            'umd/script-loader.js'
        ])
        .pipe(concat('loader-pure-wrapped.js'))
        .pipe(gulp.dest('dist'));
});


gulp.task('copy-es6promise-map', function() {
    return gulp.src([
        'node_modules/es6-promise/dist/es6-promise.map'
    ])
    .pipe(gulp.dest('dist'));
});

gulp.task('jsdoc', function() {
    gulp.src(['./src/js/**/*.js', 'README.md'])
        .pipe(jsdoc('api'));
});

gulp.task('modules2', function() {
    return gulp.src('src/modules2/**/*.js')
        .pipe(gulp.dest('dist/demo/modules2'));
});

gulp.task('modules3', function() {
    return gulp.src('src/modules3/**/*.js')
        .pipe(gulp.dest('dist/demo/modules3'));
});

gulp.task('packages', function() {
    return gulp.src('src/packages/**/*.js')
        .pipe(gulp.dest('dist/demo/packages'));
});

gulp.task('modules', ['copy-bower', 'modules2', 'modules3', 'packages'], function() {
    return gulp.src('src/modules/**/*.js')
        .pipe(babel({
            plugins: ['transform-es2015-modules-amd']
        }))
        .pipe(gulp.dest('dist/demo/modules'));
});

gulp.task('test', ['build'], function() {
    var streamStripDebug = gulp.src(['umd/**/*.js', '!umd/event-emitter.js'])
        .pipe(stripDebug());

    var streamEventEmitter = gulp.src('umd/event-emitter.js');

    return merge(streamEventEmitter, streamStripDebug)
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('finish', function() {
            gulp.src(['test/**/*.js', '!test/fixture/**/*.js'])
                .pipe(mocha())
                .pipe(istanbul.writeReports());
        });
});

gulp.task('watch', ['build'], function() {
    gulp.watch(['src/**/*', '!src/config/*'], ['build']);
});

gulp.task('wrap-config-parser', function() {
    return gulp.src('src/template/config-parser.template')
        .pipe(template({
            source: fs.readFileSync('src/js/config-parser.js').toString()
        }))
        .pipe(rename('config-parser.js'))
        .pipe(gulp.dest('umd'));
});

gulp.task('wrap-event-emitter', function() {
    return gulp.src('src/template/event-emitter.template')
        .pipe(template({
            source: fs.readFileSync('src/js/event-emitter.js').toString()
        }))
        .pipe(rename('event-emitter.js'))
        .pipe(gulp.dest('umd'));
});

gulp.task('wrap-dependency-builder', function() {
    return gulp.src('src/template/dependency-builder.template')
        .pipe(template({
            source: fs.readFileSync('src/js/dependency-builder.js').toString()
        }))
        .pipe(rename('dependency-builder.js'))
        .pipe(gulp.dest('umd'));
});

gulp.task('wrap-script-loader', function() {
    return gulp.src('src/template/script-loader.template')
        .pipe(template({
            source: fs.readFileSync('src/js/script-loader.js').toString()
        }))
        .pipe(rename('script-loader.js'))
        .pipe(gulp.dest('umd'));
});

gulp.task('wrap-path-resolver', function() {
    return gulp.src('src/template/path-resolver.template')
        .pipe(template({
            source: fs.readFileSync('src/js/path-resolver.js').toString()
        }))
        .pipe(rename('path-resolver.js'))
        .pipe(gulp.dest('umd'));
});

gulp.task('wrap-url-builder', function() {
    return gulp.src('src/template/url-builder.template')
        .pipe(template({
            source: fs.readFileSync('src/js/url-builder.js').toString()
        }))
        .pipe(rename('url-builder.js'))
        .pipe(gulp.dest('umd'));
});
