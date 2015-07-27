'use strict';

var ExtendPrompt = require('../lib/extend_prompt');

module.exports = function(options) {
	var gulp = options.gulp;

	gulp.task('extend', function(cb) {
		new ExtendPrompt(cb);
	});
};