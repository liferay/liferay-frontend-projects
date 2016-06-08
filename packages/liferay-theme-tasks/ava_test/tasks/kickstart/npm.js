'use strict';

var chai = require('chai');
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
		namespace: 'kickstart_task_npm',
		registerTasks: true
	}, function(config) {
		runSequence = config.runSequence;
		tempPath = config.tempPath;

		KickstartPrompt = require('../../../lib/prompts/kickstart_prompt');

		t.end();
	});
});

test.cb.after(function(t) {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'kickstart_task_npm', t.end);
});

test.cb('should kickstart npm theme', function(t) {
	var promptInitSpy = prototypeMethodSpy.add(KickstartPrompt.prototype, 'init');

	runSequence('kickstart', function() {
		t.end();
	});

	var initArgs = promptInitSpy.getCall(0).args;

	var promptCb = initArgs[1];

	assert(initArgs[0].themeConfig.baseTheme);
	assert(initArgs[0].themeConfig.version);

	var answers = {
		module: 'some-theme',
		modules: {
			'some-theme': {}
		}
	};

	promptCb(answers);
});
