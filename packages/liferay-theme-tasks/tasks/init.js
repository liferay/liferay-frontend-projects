'use strict';

var path = require('path');

var InitPrompt = require('../lib/init_prompt');

var CWD = process.cwd();

module.exports = function(options) {
	var gulp = options.gulp;

	var store = gulp.storage;

	gulp.task('init', function(cb) {
		new InitPrompt({
			appServerPathDefault: store.get('appServerPath') || path.join(path.dirname(CWD), 'tomcat'),
			store: store
		}, cb);
	});
};