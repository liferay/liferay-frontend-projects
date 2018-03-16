'use strict';

let chai = require('chai');
let path = require('path');
let test = require('ava');

let assert = chai.assert;

chai.use(require('chai-fs'));

let testUtil = require('../../util');

let runSequence;
let tempPath;

let initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme(
		{
			namespace: 'upgrade_task_create_deprecated_mixins',
			themeName: 'upgrade-theme',
			version: '6.2',
			registerTasksOptions: {
				pathSrc: 'src',
				rubySass: true,
			},
		},
		function(config) {
			runSequence = config.runSequence;
			tempPath = config.tempPath;

			t.end();
		}
	);
});

test.cb.after(function(t) {
	process.chdir(initCwd);

	testUtil.cleanTempTheme(
		'upgrade-theme',
		'6.2',
		'upgrade_task_create_deprecated_mixins',
		t.end
	);
});

test.cb('should create deprecated mixins file', function(t) {
	runSequence('upgrade:config', 'upgrade:create-deprecated-mixins', function(
		err
	) {
		if (err) throw err;

		assert.isFile(path.join(tempPath, 'src/css/_deprecated_mixins.scss'));

		t.end();
	});
});
