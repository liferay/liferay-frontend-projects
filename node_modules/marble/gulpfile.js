var gulp = require('gulp');
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');
var sass = require('gulp-sass');

// All -------------------------------------------------------------------------

gulp.task('default', ['bootstrap', 'fonts']);

// Bootstrap -------------------------------------------------------------------

gulp.task('watch', function() {
	gulp.watch('src/*.scss', ['bootstrap']);
});

gulp.task('bootstrap', function() {
	return gulp.src('src/**/*.scss')
		.pipe(sass({includePaths: ['node_modules']}))
		.pipe(gulp.dest('build'));
});

// Fonts -----------------------------------------------------------------------

gulp.task('fonts', ['font-icon-12', 'font-icon-16', 'font-galano']);

gulp.task('font-icon-12', function() {
	return gulp.src('src/fonts/icon-12/*.svg')
		.pipe(iconfontCss({
			fontName: 'icon-12',
			path: 'src/fonts/.template-12',
			targetPath: 'icon-12.css'
		}))
		.pipe(iconfont({
			fontName: 'icon-12',
			normalize: true,
			log: function() {}
		}))
		.pipe(gulp.dest('build/fonts/icon-12'));
});

gulp.task('font-icon-16', function() {
	return gulp.src('src/fonts/icon-16/*.svg')
		.pipe(iconfontCss({
			fontName: 'icon-16',
			path: 'src/fonts/.template-16',
			targetPath: 'icon-16.css'
		}))
		.pipe(iconfont({
			fontName: 'icon-16',
			normalize: true,
			log: function() {}
		}))
		.pipe(gulp.dest('build/fonts/icon-16'));
});

gulp.task('font-galano', function () {
	return gulp.src(['src/fonts/galano/*'])
		.pipe(gulp.dest('build/fonts/galano'));
});
