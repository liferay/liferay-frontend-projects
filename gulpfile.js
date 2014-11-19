var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var watch = require('gulp-watch');

gulp.task('clean', function (callback) {
    del(['dist'], callback);
});

gulp.task('config', function() {
    return gulp.src('src/config/**/*.*')
        .pipe(gulp.dest('dist/config'));
});

gulp.task('js', function() {
    return gulp.src('src/js/**/*.*')
        .pipe(gulp.dest('dist/js'));
});

gulp.task('modules', function() {
    return gulp.src('src/modules/**/*.*')
        .pipe(gulp.dest('dist/modules'));
});

gulp.task('vendor', function() {
    return gulp.src('src/vendor/**/*.*')
        .pipe(gulp.dest('dist/vendor'));
});

gulp.task('demo', function() {
    return gulp.src('src/demo/**/*.*')
        .pipe(gulp.dest('dist'));
});

gulp.task('build', function(callback) {
    runSequence('clean', ['config', 'js', 'modules', 'vendor', 'demo'], callback);
});

gulp.task('default', function(callback) {
    runSequence('build', callback);
});

gulp.task('watch', ['build'], function () {
    watch('src/**/*.*', function (files, cb) {
        gulp.start('build', cb);
    });
});