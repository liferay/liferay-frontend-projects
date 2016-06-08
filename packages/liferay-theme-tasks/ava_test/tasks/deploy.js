'use strict';

var chai = require('chai');
var del = require('del');
var fs = require('fs-extra');
var Gulp = require('gulp').Gulp;
var path = require('path');
var test = require('ava');

var testUtil = require('../util');

var registerTasks;
var runSequence;

var assert = chai.assert;
chai.use(require('chai-fs'));

var initCwd = process.cwd();

var deployPath;
var tempPath;

test.cb.before(function(t) {
	testUtil.copyTempTheme({
		namespace: 'deploy_task',
		registerTasks: true
	}, function(config) {
		runSequence = config.runSequence;
		tempPath = config.tempPath;

		deployPath = path.join(tempPath, '../appserver/deploy');

		var store = config.gulp.storage;

		store.set('deployPath', deployPath);
		store.set('webBundleDir');

		fs.mkdirsSync(deployPath);

		t.end();
	});
});

test.cb.after(function(t) {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'deploy_task', function() {
		del.sync(path.join(deployPath, '**'), {
			force: true
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
