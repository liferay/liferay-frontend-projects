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
			namespace: 'upgrade_task_create_backup_files',
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

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme(
		'upgrade-theme',
		'6.2',
		'upgrade_task_create_backup_files'
	);
});

test.cb(
	'upgrade:create-backup-files should create backup files from source',
	function(t) {
		runSequence('upgrade:create-backup-files', function(err) {
			if (err) throw err;

			assert.isDirectory(
				path.join(tempPath, '_backup'),
				'_backup is a directory'
			);
			assert.isDirectory(
				path.join(tempPath, '_backup/src'),
				'_backup/src is a directory'
			);
			assert.isFile(
				path.join(tempPath, '_backup/src/css/custom.css'),
				'_backup/src/css/custom.css is a file'
			);

			t.end();
		});
	}
);
