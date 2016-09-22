'use strict';

var chai = require('chai');
var del = require('del');
var fs = require('fs-extra');
var GogoShellHelper = require('gogo-shell-helper');
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
		namespace: 'watch_task_socket',
		registerTasksOptions: {
			gogoShellConfig: {
				host: '0.0.0.0',
				port: 1337
			}
		}
	}, function(config) {
		gulp = config.gulp;
		runSequence = config.runSequence;
		tempPath = config.tempPath;

		appServerPathPlugin = path.join(tempPath, '../appserver');

		config.gulp.storage.set({
			appServerPath: tempPath,
			appServerPathPlugin: appServerPathPlugin,
			deployed: true
		});

		t.end();
	});
});

test.cb.after(function(t) {
	testUtil.cleanTempTheme('base-theme', '7.0', 'watch_task_socket', t.end);
});

test.cb('watch task should start watch socket', function(t) {
	var helper = GogoShellHelper.start({
		host: '0.0.0.0',
		port: 1337,
		commands: [
			{
				command: 'install webbundledir:',
				response: 'Bundle ID: 321'
			},
			{
				command: 'start'
			},
			{
				command: 'stop'
			},
			{
				command: 'uninstall'
			},
			{
				command: 'lb -u | grep',
				response: '123|Active|1|install webbundle:file///path/to/base-theme.war'
			},
			{
				command: 'lb base-theme',
				response: 'No matching bundles found'
			}
		]
	});

	var watch = gulp.watch;

	gulp.watch = function() {
		assert.equal(arguments[0], 'custom_src_path/**/*');

		var watchCallback = arguments[1];

		var webBundleBuild = path.join(tempPath, '.web_bundle_build');

		assert.notIsEmptyDirectory(webBundleBuild);
		assert.notIsEmptyDirectory(webBundleBuild, 'css');
		assert.notIsEmptyDirectory(webBundleBuild, 'images');
		assert.notIsEmptyDirectory(webBundleBuild, 'js');
		assert.notIsEmptyDirectory(webBundleBuild, 'templates');
		assert.notIsEmptyDirectory(webBundleBuild, 'themelets');
		assert.notIsEmptyDirectory(webBundleBuild, 'WEB-INF');

		gulp.watch = watch;

		try {
			helper.close(function() {
				t.end();
			});
		}
		catch (e) {
			t.end();
		}
	};

	runSequence('watch', function() {
		console.log('watching');
	});
});
