'use strict';

var _ = require('lodash');
var chai = require('chai');
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var path = require('path');
var sinon = require('sinon');

var GlobalModulePrompt = require('../../../lib/prompts/global_module_prompt.js');
var ModulePrompt = require('../../../lib/prompts/module_prompt.js');
var promptUtil = require('../../../lib/prompts/prompt_util.js');
var testUtil = require('../../util.js');
var themeFinder = require('../../../lib/theme_finder');

var assertBoundFunction = testUtil.assertBoundFunction;

var assert = chai.assert;

var prototypeMethodSpy = new testUtil.PrototypeMethodSpy();

describe('GlobalModulePrompt', function() {
	var prototype;

	beforeEach(function() {
		prototype = _.create(GlobalModulePrompt.prototype);
	});

	afterEach(function() {
		prototypeMethodSpy.flush();
	});

	describe('constructor', function() {
		it('should pass arguments to init', function() {
			var initSpy = prototypeMethodSpy.add(GlobalModulePrompt.prototype, 'init');

			new GlobalModulePrompt({}, _.noop);

			assert(initSpy.calledWith({}, _.noop));
		});
	});

	describe('init', function() {
		it('should assign callback as done property and invoke prompting', function() {
			prototype._getGlobalModules = sinon.spy();
			var initSpy = prototypeMethodSpy.add(ModulePrompt.prototype, 'init');

			prototype.init({
				selectedModules: ['module'],
				themelet: true
			}, _.noop);

			var cb = prototype._getGlobalModules.getCall(0).args[0];

			cb('modules');

			// TODO assert that initSpy is called with correct args
			assert(initSpy.calledOnce);
			assert.deepEqual(prototype.selectedModules, ['module']);
			assert.equal(prototype.modules, 'modules');
			assert.equal(prototype.done, _.noop);
			assert.equal(prototype.themelet, true);
		});
	});

	describe('_afterPrompt', function() {
		it('should log message if no modules are found', function() {
			prototype.done = sinon.spy();

			var logSpy = prototypeMethodSpy.add(gutil, 'log');

			prototype._afterPrompt({});

			assert(logSpy.getCall(0).args[0].match(/No globally installed/));

			assert(prototype.done.calledWith({}));
		});
	});

	describe('_getGlobalModules', function() {
		it('should invoke themeFinder.getLiferayThemeModules', function() {
			var getLiferayThemeModulesSpy = prototypeMethodSpy.add(themeFinder, 'getLiferayThemeModules');

			prototype.themelet = 'themelet';

			prototype._getGlobalModules(_.noop);

			assert(getLiferayThemeModulesSpy.calledWith({
				globalModules: true,
				themelet: 'themelet'
			}, _.noop));
		});
	});
});
