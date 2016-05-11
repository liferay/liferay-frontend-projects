'use strict';

var _ = require('lodash');
var chai = require('chai');
var inquirer = require('inquirer');
var path = require('path');
var sinon = require('sinon');

var KickstartPrompt = require('../../../lib/prompts/kickstart_prompt.js');
var GlobalModulePrompt = require('../../../lib/prompts/global_module_prompt.js');
var NPMModulePrompt = require('../../../lib/prompts/npm_module_prompt.js');

var assert = chai.assert;

describe('KickstartPrompt', function() {
	var prototype;

	beforeEach(function() {
		prototype = _.create(KickstartPrompt.prototype);
	});

	describe('constructor', function() {
		it('should pass arguments to init', function() {
			var init = KickstartPrompt.prototype.init;

			KickstartPrompt.prototype.init = sinon.spy();

			new KickstartPrompt(_.noop);

			assert(KickstartPrompt.prototype.init.calledWith(_.noop));

			KickstartPrompt.prototype.init = init;
		});
	});

	describe('init', function() {
		it('should should assign callback as done property, set themeConfig, and invoke prompting', function() {
			prototype._promptThemeSource = sinon.spy();

			var themeConfig = {
				version: '7.0'
			};

			prototype.init({
				themeConfig: themeConfig
			}, _.noop);

			assert(prototype._promptThemeSource.calledOnce);
			assert.deepEqual(prototype.themeConfig, themeConfig);
			assert.equal(prototype.done, _.noop);
		});
	});

	describe('_afterPromptModule', function() {
		it('should pass answers to done prop or invoke _installTempModule', function() {
			var answers = {
				modules: {
					'some-theme': {}
				}
			};

			prototype._installTempModule = sinon.spy();
			prototype.done = sinon.spy();

			prototype._afterPromptModule(answers);

			assert(prototype._installTempModule.notCalled);
			assert(prototype.done.calledWith(answers));

			answers.module = 'some-theme';

			prototype._afterPromptModule(answers);

			assert(prototype._installTempModule.calledWith('some-theme'));

			prototype._installTempModule.getCall(0).args[1]();

			assert(prototype.done.getCall(1).calledWith(answers));
		});

		it('should set modulePath property of answers object if realPath exists in pkg', function() {
			var answers = {
				module: 'some-theme',
				modules: {
					'some-theme': {
						realPath: '/path/to/some-theme'
					}
				}
			};

			prototype._installTempModule = sinon.spy();
			prototype.done = sinon.spy();

			prototype._afterPromptModule(answers);

			assert(prototype._installTempModule.notCalled);
			assert(prototype.done.calledWith(answers));
			assert.equal(answers.modulePath, '/path/to/some-theme/src');
		});
	});

	describe('_afterPromptThemeSource', function() {
		it('should invoke correct prompt based on themeSource answer passing _afterPromptModule as callback', function() {
			var init = NPMModulePrompt.prototype.init;

			NPMModulePrompt.prototype.init = sinon.spy();

			var answers = {
				themeSource: 'npm'
			};

			prototype._afterPromptThemeSource(answers);

			assert(NPMModulePrompt.prototype.init.calledOnce);

			NPMModulePrompt.prototype.init = init;

			var init = GlobalModulePrompt.prototype.init;

			GlobalModulePrompt.prototype.init = sinon.spy();

			answers.themeSource = 'global';

			prototype._afterPromptThemeSource(answers);

			assert(GlobalModulePrompt.prototype.init.calledOnce);

			GlobalModulePrompt.prototype.init = init;
		});
	});

	describe('_installTempModule', function() {
		it('should pass', function(done) {
			var name = 'a-theme-name-that-should-never-exist';

			prototype._installTempModule(name, function(err) {
				var command = 'npm install --prefix ' + path.join(process.cwd(), '.temp_node_modules') + ' ' + name;

				if (err.cmd) {
					assert(err.cmd.indexOf(command) > -1);
				}

				done();
			});
		});
	});

	describe('_promptThemeSource', function() {
		it('should pass', function() {
			var prompt = inquirer.prompt;

			inquirer.prompt = sinon.spy();
			prototype._afterPromptThemeSource = sinon.spy();

			prototype._promptThemeSource();

			var args = inquirer.prompt.getCall(0).args;

			assert.equal(args[0][0].name, 'themeSource');

			args[1]('arguments');

			assert(prototype._afterPromptThemeSource.calledWith('arguments'));

			inquirer.prompt = prompt;
		});
	});
});
