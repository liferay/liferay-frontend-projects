'use strict';

var _ = require('lodash');
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var path = require('path');
var sinon = require('sinon');
var test = require('ava');

var testUtil = require('../../util.js');

var ModulePrompt;
var promptUtil;
var themeFinder;

var assertBoundFunction = testUtil.assertBoundFunction;
var prototypeMethodSpy = new testUtil.PrototypeMethodSpy();

var initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme({
		namespace: 'module_prompt'
	}, function(config) {
		ModulePrompt = require('../../../lib/prompts/module_prompt.js');
		promptUtil = require('../../../lib/prompts/prompt_util.js');
		themeFinder = require('../../../lib/theme_finder');

		t.end();
	});
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'module_prompt');
});

var prototype;

test.beforeEach(function() {
	prototype = _.create(ModulePrompt.prototype);
});

test.afterEach(function() {
	prototypeMethodSpy.flush();
});

test('constructor should pass arguments to init', function(t) {
	var initSpy = prototypeMethodSpy.add(ModulePrompt.prototype, 'init');

	new ModulePrompt({}, _.noop);

	t.true(initSpy.calledWith({}, _.noop));
});

test('init should assign callback as done property and invoke prompting', function(t) {
	prototype._prompt = sinon.spy();

	prototype.init({
		modules: 'modules',
		selectedModules: ['module'],
		themelet: true,
	}, _.noop);

	t.is(prototype.modules, 'modules');
	t.deepEqual(prototype.selectedModules, ['module']);
	t.true(prototype._prompt.calledOnce);
	t.is(prototype.done, _.noop);
	t.is(prototype.themelet, true)
});

test('_afterPrompt should parse themelet data if themelet is true and pass answers to done', function(t) {
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

	t.true(prototype.done.calledWith({
		addedModules: ['themelet-1'],
		module: {
			'themelet-1': true
		},
		modules: 'modules'
	}));
});

test('_filterModuleshould return unmodified input', function(t) {
	var val = prototype._filterModule('some-value');

	t.is(val, 'some-value');
});

test('_filterModule should return map of checked and unchecked themelets', function(t) {
	prototype.modules = {
		'themelet-1': {},
		'themelet-2': {},
		'themelet-3': {}
	};
	prototype.themelet = true;

	var val = prototype._filterModule(['themelet-1']);

	t.deepEqual(val, {
		'themelet-1': true,
		'themelet-2': false,
		'themelet-3': false
	});
});

test('_getModuleWhen should return false if no modules are present', function(t) {
	var retVal = prototype._getModuleWhen();

	t.true(!retVal, 'it is false');

	prototype.modules = {
		'themelet-1': {}
	};

	retVal = prototype._getModuleWhen();

	t.true(retVal, 'it is true');
});

test('_getModuleChoices should invoke proptUtil.getModulesChoices', function(t) {
	var getModuleChoicesSpy = prototypeMethodSpy.add(promptUtil, 'getModuleChoices');

	prototype.modules = 'modules';

	prototype._getModuleChoices();

	t.true(getModuleChoicesSpy.calledWith('modules', prototype));
});

test('_prompt should bind correct functions to prompt question', function(t) {
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
