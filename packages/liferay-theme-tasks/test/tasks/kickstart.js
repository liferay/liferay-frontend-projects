'use strict';

var chai = require('chai');
var del = require('del');
var fs = require('fs-extra');
var Gulp = require('gulp').Gulp;
var os = require('os');
var path = require('path');
var sinon = require('sinon');

var testUtil = require('../util');

var prototypeMethodSpy = new testUtil.PrototypeMethodSpy();

var KickstartPrompt;
var registerTasks;
var runSequence;

var assert = chai.assert;
chai.use(require('chai-fs'));

var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', '7.0', 'base-theme');

describe('Kickstart Task', function() {
	before(function(done) {
		this.timeout(10000);

		var instance = this;

		instance._initCwd = process.cwd();

		fs.copy(path.join(__dirname, '../fixtures/themes/7.0/base-theme'), tempPath, function (err) {
			if (err) throw err;

			process.chdir(tempPath);

			instance._tempPath = tempPath;

			testUtil.deleteJsFromCache();

			KickstartPrompt = require('../../lib/prompts/kickstart_prompt');
			registerTasks = require('../../index.js').registerTasks;

			var gulp = new Gulp();

			registerTasks({
				distName: 'base-theme',
				pathBuild: './custom_build_path',
				gulp: gulp,
				pathSrc: './custom_src_path',
				rubySass: false
			});

			runSequence = require('run-sequence').use(gulp);

			done();
		});
	});

	after(function(done) {
		var instance = this;

		del([path.join(tempPath, '**')], {
			force: true
		}, function() {
			process.chdir(instance._initCwd);

			done();
		});
	});

	afterEach(function() {
		prototypeMethodSpy.flush();
	});

	it('should kickstart npm theme', function(done) {
		var promptInitSpy = prototypeMethodSpy.add(KickstartPrompt.prototype, 'init');

		runSequence('kickstart', function() {
			done();
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

	it('should kickstart globally installed theme', function(done) {
		var promptInitSpy = prototypeMethodSpy.add(KickstartPrompt.prototype, 'init');

		runSequence('kickstart', function() {
			var srcDir = path.join(tempPath, 'custom_src_path');

			assert.fileContent(path.join(srcDir, 'css/_custom.scss'), '/* kickstart-theme css */');
			assert.fileContent(path.join(srcDir, 'images/image.png'), 'kickstart-theme png');
			assert.fileContent(path.join(srcDir, 'js/main.js'), '// kickstart-theme js');
			assert.fileContent(path.join(srcDir, 'templates/portal_normal.ftl'), 'kickstart-theme ftl');

			done();
		});

		var initArgs = promptInitSpy.getCall(0).args;

		var promptCb = initArgs[1];

		var kickstartThemePath = path.join(__dirname, '../fixtures/themes/7.0/kickstart-theme/src');

		var answers = {
			module: 'kickstart-theme',
			modulePath: kickstartThemePath,
			modules: {
				'some-theme': {}
			},
		};

		promptCb(answers);
	});
});
