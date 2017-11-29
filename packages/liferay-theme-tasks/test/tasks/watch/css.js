'use strict';

let chai = require('chai');
let del = require('del');
let fs = require('fs-extra');
let path = require('path');
let test = require('ava');

let testUtil = require('../../util');

let gulp;
let runSequence;

let assert = chai.assert;

chai.use(require('chai-fs'));

let appServerPathPlugin;
let tempPath;

let initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme(
		{
			namespace: 'watch_task_css',
			registerTasks: true,
		},
		function(config) {
			gulp = config.gulp;
			runSequence = config.runSequence;
			tempPath = config.tempPath;

			appServerPathPlugin = path.join(
				tempPath,
				'../appserver/webapps/base-theme'
			);

			config.gulp.storage.set({
				appServerPathPlugin: appServerPathPlugin,
				deployed: true,
			});

			t.end();
		}
	);
});

test.cb.after(function(t) {
	testUtil.cleanTempTheme('base-theme', '7.0', 'watch_task_css', t.end);
});

test.cb('watch task should deploy css files correctly on change', function(t) {
	let filePath = path.join(tempPath, 'custom_src_path/css/_custom.scss');

	gulp.storage.set('changedFile', {
		path: filePath,
		type: 'changed',
	});

	let fileContents =
		fs.readFileSync(filePath, 'utf8') + '\n\n/* this is the change */';

	fs.writeFileSync(filePath, fileContents, 'utf8');

	runCssWatchSequence(function() {
		let cssDir = path.join(appServerPathPlugin, 'css');

		assert.isFile(path.join(cssDir, 'main.css'));
		assert.isFile(path.join(cssDir, 'aui.css'));

		let regex = /\/\* this is the change \*\//;

		assert.fileContentMatch(path.join(cssDir, 'main.css'), regex);

		t.throws(function() {
			fs.statSync(path.join(appServerPathPlugin, 'js'));
		});

		t.end();
	});
});

function runCssWatchSequence(cb) {
	runSequence(
		'build:clean',
		'build:base',
		'build:src',
		'build:themelet-src',
		'build:themelet-css-inject',
		'build:rename-css-dir',
		'build:prep-css',
		'build:compile-css',
		'build:move-compiled-css',
		'build:remove-old-css-dir',
		'deploy:css-files',
		cb
	);
}
