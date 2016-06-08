'use strict';

var _ = require('lodash');
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var path = require('path');
var sinon = require('sinon');
var test = require('ava');

var testUtil = require('../../util.js');

var ModulePrompt;
var NPMModulePrompt;
var themeFinder;

var assertBoundFunction = testUtil.assertBoundFunction;
var prototypeMethodSpy = new testUtil.PrototypeMethodSpy();

var initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme({
		namespace: 'npm_module_prompt'
	}, function(config) {
		NPMModulePrompt = require('../../../lib/prompts/npm_module_prompt.js');
		ModulePrompt = require('../../../lib/prompts/module_prompt.js');
		themeFinder = require('../../../lib/theme_finder');

		t.end();
	});
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'npm_module_prompt');
});

var prototype;

test.beforeEach(function() {
	prototype = _.create(NPMModulePrompt.prototype);
});

test.afterEach(function() {
	prototypeMethodSpy.flush();
});

test('constructor should pass arguments to init', function(t) {
	var initSpy = prototypeMethodSpy.add(NPMModulePrompt.prototype, 'init');

	new NPMModulePrompt({}, _.noop);

	t.true(initSpy.calledWith({}, _.noop));
});

test('init should assign callback as done property and invoke prompting', function(t) {
	prototype._promptSearchTerms = sinon.spy();

	prototype.init({
		selectedModules: ['module'],
		themelet: true
	}, _.noop);

	t.true(prototype._promptSearchTerms.calledOnce);
	t.deepEqual(prototype.selectedModules, ['module']);
	t.is(prototype.done, _.noop);
	t.is(prototype.themelet, true);
});

test('_afterPrompt should pass answers to done property', function(t) {
	prototype.done = sinon.spy();

	var answers = {
		module: 'some-module'
	};

	prototype._afterPrompt(answers);

	t.true(prototype.done.calledWith(answers));
});

test('_afterPromptSearchTerms should invoke _getNPMModules with searchTerms', function(t) {
	prototype._getNPMModules = sinon.spy();

	var answers = {
		searchTerms: 'some keyword'
	};

	var cbSpy = sinon.spy();

	prototype._afterPromptSearchTerms(answers, cbSpy);

	prototype._getNPMModules.calledWith(answers.searchTerms, cbSpy);
});

test('_afterPromptSearchTerms should either re-prompt search terms or invoke module prompt', function(t) {
	prototype._getNPMModules = sinon.spy();
	prototype._promptSearchTerms = sinon.spy();
	var logSpy = prototypeMethodSpy.add(gutil, 'log');
	var modulePromptInitSpy = prototypeMethodSpy.add(ModulePrompt.prototype, 'init');

	var answers = {
		searchTerms: 'some keyword'
	};

	prototype._afterPromptSearchTerms(answers);

	var args = prototype._getNPMModules.getCall(0).args;

	t.is(args[0], 'some keyword');

	var cb = args[1];

	cb();

	t.true(logSpy.calledOnce);
	t.true(prototype._promptSearchTerms.calledOnce);

	var modules = {
		'some-module': {}
	};

	cb(modules);

	t.deepEqual(prototype.modules, modules);

	t.true(modulePromptInitSpy.calledOnce);
});

test('_getNPMModules should invoke themeFinder.getLiferayThemeModules', function(t) {
	var getLiferayThemeModulesSpy = prototypeMethodSpy.add(themeFinder, 'getLiferayThemeModules');

	prototype.themelet = 'themelet';

	prototype._getNPMModules('some keyword', _.noop);

	t.true(getLiferayThemeModulesSpy.calledWith({
		globalModules: false,
		searchTerms: 'some keyword',
		themelet: 'themelet'
	}, _.noop));
});

test('_promptSearchTerms should prompt for search terms', function(t) {
	var promptSpy = prototypeMethodSpy.add(inquirer, 'prompt');

	var assertAfterPromptSearchTerms = assertBoundFunction(prototype, '_afterPromptSearchTerms');

	prototype._promptSearchTerms();

	var args = promptSpy.getCall(0).args;

	var question = args[0][0];

	t.true(/themes/.test(question.message));
	t.is(question.name, 'searchTerms');

	assertAfterPromptSearchTerms(args[1]);
});
