'use strict';

let chai = require('chai');
let path = require('path');
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
			namespace: 'kickstart_task_global',
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

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('kickstart-theme', '7.0', 'kickstart_task_global');
});

test.cb('should kickstart globally installed theme', function(t) {
	let promptInitSpy = prototypeMethodSpy.add(
		KickstartPrompt.prototype,
		'init'
	);

	runSequence('kickstart', function() {
		let srcDir = path.join(tempPath, 'custom_src_path');

		assert.fileContent(
			path.join(srcDir, 'css/_custom.scss'),
			'/* kickstart-theme css */'
		);
		assert.fileContent(
			path.join(srcDir, 'images/image.png'),
			'kickstart-theme png'
		);
		assert.fileContent(
			path.join(srcDir, 'js/main.js'),
			'// kickstart-theme js\n'
		);
		assert.fileContent(
			path.join(srcDir, 'templates/portal_normal.ftl'),
			'kickstart-theme ftl'
		);

		t.end();
	});

	let initArgs = promptInitSpy.getCall(0).args;

	let promptCb = initArgs[1];

	let kickstartThemePath = path.join(
		__dirname,
		'../../fixtures/themes/7.0/kickstart-theme/src'
	);

	let answers = {
		module: 'kickstart-theme',
		modulePath: kickstartThemePath,
		modules: {
			'some-theme': {},
		},
	};

	promptCb(answers);
});
