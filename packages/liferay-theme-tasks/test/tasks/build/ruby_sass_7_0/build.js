'use strict';

let test = require('ava');

let buildTestHelper = require('../../../helpers/tasks/build');

let runSequence;

buildTestHelper.testBoilerplate(
	test,
	{
		hookFn: buildTestHelper.buildHookFn,
		namespace: 'ruby_sass_build_task',
		rubySass: true,
		themeName: 'base-theme',
		version: '7.0',
	},
	function(config) {
		runSequence = config.runSequence;
	}
);

test.cb('build task should correctly compile theme', function(t) {
	runSequence('build', function() {
		t.end();
	});
});
