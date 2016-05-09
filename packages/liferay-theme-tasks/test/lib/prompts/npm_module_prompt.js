'use strict';

var _ = require('lodash');
var chai = require('chai');
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var path = require('path');
var sinon = require('sinon');

var NPMModulePrompt = require('../../../lib/prompts/npm_module_prompt.js');
var ModulePrompt = require('../../../lib/prompts/module_prompt.js');
var testUtil = require('../../util.js');
var themeFinder = require('../../../lib/theme_finder');

var assertBoundFunction = testUtil.assertBoundFunction;

var assert = chai.assert;

var prototypeMethodSpy = new testUtil.PrototypeMethodSpy();

describe('NPMModulePrompt', function() {
	var prototype;

	beforeEach(function() {
		prototype = _.create(NPMModulePrompt.prototype);
	});

	afterEach(function() {
		prototypeMethodSpy.flush();
	});

	describe('constructor', function() {
		it('should pass arguments to init', function() {
			var initSpy = prototypeMethodSpy.add(NPMModulePrompt.prototype, 'init');

			new NPMModulePrompt({}, _.noop);

			assert(initSpy.calledWith({}, _.noop));
		});
	});

	describe('init', function() {
		it('should assign callback as done property and invoke prompting', function() {
			prototype._promptSearchTerms = sinon.spy();

			prototype.init({
				selectedModules: ['module'],
				themelet: true
			}, _.noop);

			assert(prototype._promptSearchTerms.calledOnce);
			assert.deepEqual(prototype.selectedModules, ['module']);
			assert.equal(prototype.done, _.noop);
			assert.equal(prototype.themelet, true);
		});
	});

	describe('_afterPrompt', function() {
		it('should pass answers to done property', function() {
			prototype.done = sinon.spy();

			var answers = {
				module: 'some-module'
			};

			prototype._afterPrompt(answers);

			assert(prototype.done.calledWith(answers));
		});
	});

	describe('_afterPromptSearchTerms', function() {
		it('should invoke _getNPMModules with searchTerms', function() {
			prototype._getNPMModules = sinon.spy();

			var answers = {
				searchTerms: 'some keyword'
			};

			var cbSpy = sinon.spy();

			prototype._afterPromptSearchTerms(answers, cbSpy);

			prototype._getNPMModules.calledWith(answers.searchTerms, cbSpy);
		});

		it('should either re-prompt search terms or invoke module prompt', function() {
			prototype._getNPMModules = sinon.spy();
			prototype._promptSearchTerms = sinon.spy();
			var logSpy = prototypeMethodSpy.add(gutil, 'log');
			var modulePromptInitSpy = prototypeMethodSpy.add(ModulePrompt.prototype, 'init');

			var answers = {
				searchTerms: 'some keyword'
			};

			prototype._afterPromptSearchTerms(answers);

			var args = prototype._getNPMModules.getCall(0).args;

			assert.equal(args[0], 'some keyword');

			var cb = args[1];

			cb();

			assert(logSpy.calledOnce);
			assert(prototype._promptSearchTerms.calledOnce);

			var modules = {
				'some-module': {}
			};

			cb(modules);

			assert.deepEqual(prototype.modules, modules);

			assert(modulePromptInitSpy.calledOnce);
		});
	});

	describe('_getNPMModules', function() {
		it('should invoke themeFinder.getLiferayThemeModules', function() {
			var getLiferayThemeModulesSpy = prototypeMethodSpy.add(themeFinder, 'getLiferayThemeModules');

			prototype.themelet = 'themelet';

			prototype._getNPMModules('some keyword', _.noop);

			assert(getLiferayThemeModulesSpy.calledWith({
				globalModules: false,
				searchTerms: 'some keyword',
				themelet: 'themelet'
			}, _.noop));
		});
	});

	describe('_promptSearchTerms', function() {
		it('should prompt for search terms', function() {
			var promptSpy = prototypeMethodSpy.add(inquirer, 'prompt');

			var assertAfterPromptSearchTerms = assertBoundFunction(prototype, '_afterPromptSearchTerms');

			prototype._promptSearchTerms();

			var args = promptSpy.getCall(0).args;

			var question = args[0][0];

			assert(question.message.match(/themes/));
			assert.equal(question.name, 'searchTerms');

			assertAfterPromptSearchTerms(args[1]);
		});
	});
});
