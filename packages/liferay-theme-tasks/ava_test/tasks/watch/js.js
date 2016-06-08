'use strict';

var chai = require('chai');
var del = require('del');
var fs = require('fs-extra');
var path = require('path');
var test = require('ava');

var testUtil = require('../../util');

var gulp;
var runSequence;

var assert = chai.assert;
chai.use(require('chai-fs'));

var appServerPathPlugin;
var tempPath;

var initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme({
		namespace: 'watch_task_js',
		registerTasks: true
	}, function(config) {
		gulp = config.gulp;
		runSequence = config.runSequence;
		tempPath = config.tempPath;

		appServerPathPlugin = path.join(tempPath, '../appserver');

		config.gulp.storage.set({
			appServerPathPlugin: appServerPathPlugin,
			deployed: true
		});

		t.end();
	});
});

test.cb.after(function(t) {
	testUtil.cleanTempTheme('base-theme', '7.0', 'watch_task_js', t.end);
});

test.cb('watch task should deploy js files correctly on change', function(t) {
	gulp.storage.set('changedFile', {
		path: 'custom_src_path/js/main.js',
		type: 'changed'
	});

	runJsWatchSequence(function() {
		var jsDir = path.join(appServerPathPlugin, 'js');

		var deployedFilePath = path.join(jsDir, 'main.js');

		assert.isFile(deployedFilePath);

		var regex = /console\.log\(\'main\.js\'\);/;

		assert.fileContentMatch(deployedFilePath, regex);

		t.throws(function() {
			fs.statSync(path.join(appServerPathPlugin, 'css'));
		});

		t.end();
	});
});

function runJsWatchSequence(cb) {
	runSequence('deploy:file', cb);
}
