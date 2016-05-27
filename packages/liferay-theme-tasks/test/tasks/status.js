'use strict';

var Gulp = require('gulp').Gulp;
var os = require('os');
var path = require('path');

var registerTasks;
var runSequence;

var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', '7.0', 'base-theme');

describe('Status Task', function() {
	before(function() {
		this._initCwd = process.cwd();

		process.chdir(path.join(__dirname, '../fixtures/themes/7.0/base-theme'));

		registerTasks = require('../../index.js').registerTasks;

		var gulp = new Gulp();

		registerTasks({
			gulp: gulp,
			rubySass: false
		});

		runSequence = require('run-sequence').use(gulp);
	});

	after(function() {
		process.chdir(this._initCwd);
	});

	it('should print base theme/themelet information', function(cb) {
		runSequence('status', cb);
	});
});
