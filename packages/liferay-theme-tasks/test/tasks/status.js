'use strict';

var test = require('ava');

var testUtil = require('../util');

var runSequence;

var initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme({
		namespace: 'status_task',
		registerTasks: true
	}, function(config) {
		runSequence = config.runSequence;

		t.end();
	});
});

test.cb.after(function(t) {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'status_task', t.end);
});

test.cb('status task should print base theme/themelet information', function(t) {
	runSequence('status', t.end);
});
