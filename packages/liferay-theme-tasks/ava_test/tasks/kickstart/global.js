'use strict';

var chai = require('chai');
var path = require('path');
var test = require('ava');

var testUtil = require('../../util');

var prototypeMethodSpy = new testUtil.PrototypeMethodSpy();

var assert = chai.assert;
chai.use(require('chai-fs'));

var KickstartPrompt;
var runSequence;
var tempPath;

var initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme({
		namespace: 'kickstart_task_global',
		registerTasks: true
	}, function(config) {
		runSequence = config.runSequence;
		tempPath = config.tempPath;

		KickstartPrompt = require('../../../lib/prompts/kickstart_prompt');

		t.end();
	});
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('kickstart-theme', '7.0', 'kickstart_task_global');
});

test.cb('should kickstart globally installed theme', function(t) {
	var promptInitSpy = prototypeMethodSpy.add(KickstartPrompt.prototype, 'init');

	runSequence('kickstart', function() {
		var srcDir = path.join(tempPath, 'custom_src_path');

		assert.fileContent(path.join(srcDir, 'css/_custom.scss'), '/* kickstart-theme css */');
		assert.fileContent(path.join(srcDir, 'images/image.png'), 'kickstart-theme png');
		assert.fileContent(path.join(srcDir, 'js/main.js'), '// kickstart-theme js');
		assert.fileContent(path.join(srcDir, 'templates/portal_normal.ftl'), 'kickstart-theme ftl');

		t.end();
	});

	var initArgs = promptInitSpy.getCall(0).args;

	var promptCb = initArgs[1];

	var kickstartThemePath = path.join(__dirname, '../../fixtures/themes/7.0/kickstart-theme/src');

	var answers = {
		module: 'kickstart-theme',
		modulePath: kickstartThemePath,
		modules: {
			'some-theme': {}
		},
	};

	promptCb(answers);
});
