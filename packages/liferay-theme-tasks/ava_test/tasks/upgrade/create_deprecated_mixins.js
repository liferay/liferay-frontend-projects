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
	testUtil.copyTempTheme({
		namespace: 'upgrade_task_create_deprecated_mixins',
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

test.cb.after(function(t) {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('upgrade-theme', '6.2', 'upgrade_task_create_deprecated_mixins', t.end);
});

test.cb('should create deprecated mixins file', function(t) {
	runSequence('upgrade:config', 'upgrade:create-deprecated-mixins', function(err) {
		if (err) throw err;

		assert.isFile(path.join(tempPath, 'src/css/_deprecated_mixins.scss'));

		t.end();
	});
});