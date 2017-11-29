'use strict';

let chai = require('chai');
let test = require('ava');

let testUtil = require('../../util');

let prototypeMethodSpy = new testUtil.PrototypeMethodSpy();

let assert = chai.assert;

chai.use(require('chai-fs'));

let KickstartPrompt;
let runSequence;
let tempPath;

let initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme(
		{
			namespace: 'kickstart_task_npm',
			registerTasks: true,
		},
		function(config) {
			runSequence = config.runSequence;
			tempPath = config.tempPath;

			KickstartPrompt = require('../../../lib/prompts/kickstart_prompt');

			t.end();
		}
	);
});

test.cb.after(function(t) {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'kickstart_task_npm', t.end);
});

test.cb('should kickstart npm theme', function(t) {
	let promptInitSpy = prototypeMethodSpy.add(
		KickstartPrompt.prototype,
		'init'
	);

	runSequence('kickstart', function() {
		t.end();
	});

	let initArgs = promptInitSpy.getCall(0).args;

	let promptCb = initArgs[1];

	assert(initArgs[0].themeConfig.baseTheme);
	assert(initArgs[0].themeConfig.version);

	let answers = {
		module: 'some-theme',
		modules: {
			'some-theme': {},
		},
	};

	promptCb(answers);
});
