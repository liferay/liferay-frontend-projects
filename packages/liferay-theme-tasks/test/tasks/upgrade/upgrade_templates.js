'use strict';

let test = require('ava');

let testUtil = require('../../util');

let runSequence;

let initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme(
		{
			namespace: 'upgrade_task_upgrade_templates',
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

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme(
		'upgrade-theme',
		'6.2',
		'upgrade_task_upgrade_templates'
	);
});

test.cb('should scrape templates for needed changes', function(t) {
	runSequence('upgrade:ftl-templates', 'upgrade:vm-templates', function(err) {
		if (err) throw err;

		// TODO

		t.end();
	});
});
