'use strict';

let chai = require('chai');
let del = require('del');
let fs = require('fs-extra');
let Gulp = require('gulp').Gulp;
let path = require('path');
let test = require('ava');

let testUtil = require('../util');

let registerTasks;
let runSequence;

let assert = chai.assert;

chai.use(require('chai-fs'));

let initCwd = process.cwd();

let deployPath;
let tempPath;

test.cb.before(function(t) {
	testUtil.copyTempTheme(
		{
			namespace: 'deploy_task',
			registerTasks: true,
		},
		function(config) {
			runSequence = config.runSequence;
			tempPath = config.tempPath;

			deployPath = path.join(tempPath, '../appserver/deploy');

			let store = config.gulp.storage;

			store.set('deployPath', deployPath);
			store.set('webBundleDir');

			fs.mkdirsSync(deployPath);

			t.end();
		}
	);
});

test.cb.after(function(t) {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'deploy_task', function() {
		del.sync(path.join(deployPath, '**'), {
			force: true,
		});

		t.end();
	});
});

test.cb('should deploy to deploy server', function(t) {
	runSequence('deploy', function(err) {
		if (err) throw err;

		assert.isFile(path.join(deployPath, 'base-theme.war'));

		t.end();
	});
});
