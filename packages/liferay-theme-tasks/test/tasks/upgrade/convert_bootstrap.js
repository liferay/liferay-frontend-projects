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
		namespace: 'upgrade_task_convert_bootstrap',
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

	testUtil.cleanTempTheme('upgrade-theme', '6.2', 'upgrade_task_convert_bootstrap');
});

test.cb('upgrade:convert-bootstrap should run convert-bootstrap-2-to-3 module on css files', function(t) {
	runSequence('upgrade:convert-bootstrap', function(err) {
		if (err) throw err;

		var customCSSPath = path.join(tempPath, 'src/css/custom.css');

		assert.notFileContentMatch(customCSSPath, /\$grayDark/);
		assert.fileContentMatch(customCSSPath, /\$gray-dark/);
		assert.fileContentMatch(customCSSPath, /\$gray-darker/);

		t.end();
	});
});
