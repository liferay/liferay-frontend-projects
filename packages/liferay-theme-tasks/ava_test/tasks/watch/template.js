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
		namespace: 'watch_task_template',
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
	testUtil.cleanTempTheme('base-theme', '7.0', 'watch_task_template', t.end);
});

test.cb('watch task should deploy template files corrently on change', function(t) {
	var filePath = path.join(tempPath, 'custom_src_path/templates/portal_normal.ftl');

	gulp.storage.set('changedFile', {
		path: filePath,
		type: 'changed'
	});

	var templatesDir = path.join(appServerPathPlugin, 'templates');

	var deployedFilePath = path.join(templatesDir, 'portal_normal.ftl');

	runTemplateWatchSequence(function() {
		assert.isFile(deployedFilePath);

		var deployedFileContent = fs.readFileSync(deployedFilePath, {
			encoding: 'utf8'
		});

		t.true(/<script src="\${theme_display.getPathThemeRoot\(\)}\/themelets\/test-themelet\/js\/main\.js"><\/script>/.test(deployedFileContent), 'themelet js got injected');

		t.end();
	});
});

function runTemplateWatchSequence(cb) {
	runSequence('build:src', 'build:themelet-src', 'build:themelet-js-inject', 'deploy:folder', cb);
}
