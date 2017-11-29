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
			namespace: 'watch_task_template',
			registerTasks: true,
		},
		function(config) {
			gulp = config.gulp;
			runSequence = config.runSequence;
			tempPath = config.tempPath;

			appServerPathPlugin = path.join(tempPath, '../appserver');

			config.gulp.storage.set({
				appServerPathPlugin: appServerPathPlugin,
				deployed: true,
			});

			t.end();
		}
	);
});

test.cb.after(function(t) {
	testUtil.cleanTempTheme('base-theme', '7.0', 'watch_task_template', t.end);
});

test.cb('watch task should deploy template files corrently on change', function(
	t
) {
	let filePath = path.join(
		tempPath,
		'custom_src_path/templates/portal_normal.ftl'
	);

	gulp.storage.set('changedFile', {
		path: filePath,
		type: 'changed',
	});

	let templatesDir = path.join(appServerPathPlugin, 'templates');

	let deployedFilePath = path.join(templatesDir, 'portal_normal.ftl');

	runTemplateWatchSequence(function() {
		assert.isFile(deployedFilePath);

		let deployedFileContent = fs.readFileSync(deployedFilePath, {
			encoding: 'utf8',
		});

		t.true(
			/<script src="\${theme_display.getPathThemeRoot\(\)}\/themelets\/test-themelet\/js\/main\.js"><\/script>/.test(
				deployedFileContent
			),
			'themelet js got injected'
		);

		t.end();
	});
});

function runTemplateWatchSequence(cb) {
	runSequence(
		'build:src',
		'build:themelet-src',
		'build:themelet-js-inject',
		'deploy:folder',
		cb
	);
}
