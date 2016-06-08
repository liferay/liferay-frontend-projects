'use strict';

var chai = require('chai');
var del = require('del');
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
		namespace: 'upgrade_task_replace_compass',
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

	testUtil.cleanTempTheme('upgrade-theme', '6.2', 'upgrade_task_replace_compass');
});

test.cb('upgrade:replace-compass should replace compass mixins with bourbon equivalents exluding anything mixins/functions on blacklist', function(t) {
	runSequence('upgrade:black-list', 'upgrade:replace-compass', function(err) {
		if (err) throw err;

		var customCSSPath = path.join(process.cwd(), 'src/css/custom.css');

		assert.fileContentMatch(customCSSPath, /@import\s"bourbon";/)
		assert.notFileContentMatch(customCSSPath, /@import\s"compass";/);

		assert.fileContentMatch(customCSSPath, /@include\sborder-radius/);
		assert.notFileContentMatch(customCSSPath, /@include\sbox-shadow/);

		t.end();
	});
});