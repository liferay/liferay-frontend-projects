'use strict';

var _ = require('lodash');
var chai = require('chai');
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var path = require('path');
var sinon = require('sinon');

var ModulePrompt = require('../../../lib/prompts/module_prompt.js');
var promptUtil = require('../../../lib/prompts/prompt_util.js');
var testUtil = require('../../util.js');
var themeFinder = require('../../../lib/theme_finder');

var assertBoundFunction = testUtil.assertBoundFunction;

var assert = chai.assert;

var prototypeMethodSpy = new testUtil.PrototypeMethodSpy();

describe('ModulePrompt', function() {
	var prototype;

	beforeEach(function() {
		prototype = _.create(ModulePrompt.prototype);
	});

	afterEach(function() {
		prototypeMethodSpy.flush();
	});

	describe('constructor', function() {
		it('should pass arguments to init', function() {
			var initSpy = prototypeMethodSpy.add(ModulePrompt.prototype, 'init');

			new ModulePrompt({}, _.noop);

			assert(initSpy.calledWith({}, _.noop));
		});
	});

	describe('init', function() {
		it('should assign callback as done property and invoke prompting', function() {
			prototype._prompt = sinon.spy();

			prototype.init({
				modules: 'modules',
				selectedModules: ['module'],
				themelet: true,
			}, _.noop);

			assert.equal(prototype.modules, 'modules');
			assert.deepEqual(prototype.selectedModules, ['module']);
			assert(prototype._prompt.calledOnce);
			assert.equal(prototype.done, _.noop);
			assert.equal(prototype.themelet, true)
		});
	});

	describe('_afterPrompt', function() {
		it('should parse themelet data if themelet is true and pass answers to done', function() {
			prototype.modules = 'modules';
			prototype.done = sinon.spy();
			prototype.themelet = true;

			prototypeMethodSpy.add(promptUtil, 'formatThemeletSelection', true).returns({
				addedModules: ['themelet-1']
			});

			prototype._afterPrompt({
				module: {
					'themelet-1': true
				}
			}, ['themelet-2']);

			assert(prototype.done.calledWith({
				addedModules: ['themelet-1'],
				module: {
					'themelet-1': true
				},
				modules: 'modules'
			}));
		});
	});

	describe('_filterModule', function() {
		it('should return unmodified input', function() {
			var val = prototype._filterModule('some-value');

			assert.equal(val, 'some-value');
		});

		it('should return map of checked and unchecked themelets', function() {
			prototype.modules = {
				'themelet-1': {},
				'themelet-2': {},
				'themelet-3': {}
			};
			prototype.themelet = true;

			var val = prototype._filterModule(['themelet-1']);

			assert.deepEqual(val, {
				'themelet-1': true,
				'themelet-2': false,
				'themelet-3': false
			});
		});
	});

	describe('_getModuleWhen', function() {
		it('should return false if no modules are present', function() {
			var retVal = prototype._getModuleWhen();

			assert(!retVal, 'it is false');

			prototype.modules = {
				'themelet-1': {}
			};

			retVal = prototype._getModuleWhen();

			assert(retVal, 'it is true');
		});
	});

	describe('_getModuleChoices', function() {
		it('should invoke proptUtil.getModulesChoices', function() {
			var getModuleChoicesSpy = prototypeMethodSpy.add(promptUtil, 'getModuleChoices');

			prototype.modules = 'modules';

			prototype._getModuleChoices();

			assert(getModuleChoicesSpy.calledWith('modules', prototype));
		});
	});

	describe('_prompt', function() {
		it('should bind correct functions to prompt question', function() {
			var promptSpy = prototypeMethodSpy.add(inquirer, 'prompt');

			var assertAfterPrompt = assertBoundFunction(prototype, '_afterPrompt');
			var assertChoicesFn = assertBoundFunction(prototype, '_getModuleChoices');
			var assertFilterFn = assertBoundFunction(prototype, '_filterModule');
			var assertWhenFn = assertBoundFunction(prototype, '_getModuleWhen');

			prototype._prompt();

			var args = promptSpy.getCall(0).args;

			var question = args[0][0];

			assertChoicesFn(question.choices);
			assertFilterFn(question.filter);
			assertWhenFn(question.when);

			assertAfterPrompt(args[1]);
		});
	});
});
