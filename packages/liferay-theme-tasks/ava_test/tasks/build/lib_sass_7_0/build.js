'use strict';

var test = require('ava');

var buildTestHelper = require('../../../helpers/tasks/build');

var runSequence;

buildTestHelper.testBoilerplate(test, {
	hookFn: buildTestHelper.buildHookFn,
	namespace: 'lib_sass_build_task',
	themeName: 'base-theme',
	version: '7.0'
}, function(config) {
	runSequence = config.runSequence;
});

test.cb('build task should correctly compile theme', function(t) {
	runSequence('build', function() {
		t.end();
	});
});
