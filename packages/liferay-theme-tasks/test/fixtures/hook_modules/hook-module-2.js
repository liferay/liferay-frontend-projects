module.exports = function(gulp) {
	gulp.hook('after:build', function(cb) {
		cb();
	});
};
