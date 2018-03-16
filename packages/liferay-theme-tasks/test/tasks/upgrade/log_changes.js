'use strict';

let test = require('ava');

let testUtil = require('../../util');

let runSequence;

let initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme(
		{
			namespace: 'upgrade_task_log_changes',
			themeName: 'upgrade-theme',
			version: '6.2',
			registerTasksOptions: {
				pathSrc: 'src',
				rubySass: true,
			},
		},
		function(config) {
			runSequence = config.runSequence;

			t.end();
		}
	);
});

test.cb.after(function(t) {
	process.chdir(initCwd);

	testUtil.cleanTempTheme(
		'upgrade-theme',
		'6.2',
		'upgrade_task_log_changes',
		t.end
	);
});

test.cb('should log changes that have been and should be made', function(t) {
	runSequence('upgrade:log-changes', function(err) {
		if (err) throw err;

		// implement sinon stubs

		t.end();
	});
});
