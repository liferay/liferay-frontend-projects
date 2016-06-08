'use strict';

var chai = require('chai');
var path = require('path');
var test = require('ava');

var assert = chai.assert;
chai.use(require('chai-fs'));

var testUtil = require('../../util');

var runSequence;
var tempPath;

var initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.cleanTempTheme('upgrade-theme', '6.2', 'upgrade_task_create_css_diff');

	testUtil.copyTempTheme({
		namespace: 'upgrade_task_create_css_diff',
		themeName: 'upgrade-theme',
		version: '6.2',
		registerTasksOptions: {
			pathSrc: 'src',
			rubySass: true
		}
	}, function(config) {
		runSequence = config.runSequence;
		tempPath = config.tempPath;

		t.end();
	});
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('upgrade-theme', '6.2', 'upgrade_task_create_css_diff');
});

test.cb('upgrade:create-css-diff should create css.diff file showing what has been changed in theme css files', function(t) {
	runSequence('upgrade:create-backup-files', 'upgrade:convert-bootstrap', 'upgrade:create-css-diff', function(err) {
		if (err) throw err;

		var cssDiffPath = path.join(tempPath, '_backup/css.diff');

		assert.fileContentMatch(cssDiffPath, /-\$grayDark:\s#333;/);
		assert.fileContentMatch(cssDiffPath, /\+\$gray-dark:\s#333;/);

		t.end();
	});
});
