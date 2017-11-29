'use strict';

let _ = require('lodash');
let gutil = require('gulp-util');
let inquirer = require('inquirer');
let path = require('path');
let sinon = require('sinon');
let test = require('ava');

let testUtil = require('../../util.js');

let ModulePrompt;
let promptUtil;
let themeFinder;

let assertBoundFunction = testUtil.assertBoundFunction;
let prototypeMethodSpy = new testUtil.PrototypeMethodSpy();

let initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme(
		{
			namespace: 'module_prompt',
		},
		function(config) {
			ModulePrompt = require('../../../lib/prompts/module_prompt.js');
			promptUtil = require('../../../lib/prompts/prompt_util.js');
			themeFinder = require('../../../lib/theme_finder');

			t.end();
		}
	);
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'module_prompt');
});

let prototype;

test.beforeEach(function() {
	prototype = _.create(ModulePrompt.prototype);
});

test.afterEach(function() {
	prototypeMethodSpy.flush();
});

test('constructor should pass arguments to init', function(t) {
	let initSpy = prototypeMethodSpy.add(ModulePrompt.prototype, 'init');

	new ModulePrompt({}, _.noop);

	t.true(initSpy.calledWith({}, _.noop));
});

test('init should assign callback as done property and invoke prompting', function(
	t
) {
	prototype._prompt = sinon.spy();

	prototype.init(
		{
			modules: 'modules',
			selectedModules: ['module'],
			themelet: true,
		},
		_.noop
	);

	t.is(prototype.modules, 'modules');
	t.deepEqual(prototype.selectedModules, ['module']);
	t.true(prototype._prompt.calledOnce);
	t.is(prototype.done, _.noop);
	t.is(prototype.themelet, true);
});

test('_afterPrompt should parse themelet data if themelet is true and pass answers to done', function(
	t
) {
	prototype.modules = 'modules';
	prototype.done = sinon.spy();
	prototype.themelet = true;

	prototypeMethodSpy
		.add(promptUtil, 'formatThemeletSelection', true)
		.returns({
			addedModules: ['themelet-1'],
		});

	prototype._afterPrompt(
		{
			module: {
				'themelet-1': true,
			},
		},
		['themelet-2']
	);

	t.true(
		prototype.done.calledWith({
			addedModules: ['themelet-1'],
			module: {
				'themelet-1': true,
			},
			modules: 'modules',
		})
	);
});

test('_filterModuleshould return unmodified input', function(t) {
	let val = prototype._filterModule('some-value');

	t.is(val, 'some-value');
});

test('_filterModule should return map of checked and unchecked themelets', function(
	t
) {
	prototype.modules = {
		'themelet-1': {},
		'themelet-2': {},
		'themelet-3': {},
	};
	prototype.themelet = true;

	let val = prototype._filterModule(['themelet-1']);

	t.deepEqual(val, {
		'themelet-1': true,
		'themelet-2': false,
		'themelet-3': false,
	});
});

test('_getModuleWhen should return false if no modules are present', function(
	t
) {
	let retVal = prototype._getModuleWhen();

	t.true(!retVal, 'it is false');

	prototype.modules = {
		'themelet-1': {},
	};

	retVal = prototype._getModuleWhen();

	t.true(retVal, 'it is true');
});

test('_getModuleChoices should invoke proptUtil.getModulesChoices', function(
	t
) {
	let getModuleChoicesSpy = prototypeMethodSpy.add(
		promptUtil,
		'getModuleChoices'
	);

	prototype.modules = 'modules';

	prototype._getModuleChoices();

	t.true(getModuleChoicesSpy.calledWith('modules', prototype));
});

test('_prompt should bind correct functions to prompt question', function(t) {
	t.plan(0);

	let promptSpy = prototypeMethodSpy.add(inquirer, 'prompt');

	let assertAfterPrompt = assertBoundFunction(prototype, '_afterPrompt');
	let assertChoicesFn = assertBoundFunction(prototype, '_getModuleChoices');
	let assertFilterFn = assertBoundFunction(prototype, '_filterModule');
	let assertWhenFn = assertBoundFunction(prototype, '_getModuleWhen');

	prototype._prompt();

	let args = promptSpy.getCall(0).args;

	let question = args[0][0];

	assertChoicesFn(question.choices);
	assertFilterFn(question.filter);
	assertWhenFn(question.when);

	assertAfterPrompt(args[1]);
});
