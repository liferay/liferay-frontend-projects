'use strict';

let _ = require('lodash');
let gutil = require('gulp-util');
let inquirer = require('inquirer');
let path = require('path');
let sinon = require('sinon');
let test = require('ava');

let testUtil = require('../../util.js');

let ModulePrompt;
let NPMModulePrompt;
let themeFinder;

let assertBoundFunction = testUtil.assertBoundFunction;
let prototypeMethodSpy = new testUtil.PrototypeMethodSpy();

let initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme(
		{
			namespace: 'npm_module_prompt',
		},
		function(config) {
			NPMModulePrompt = require('../../../lib/prompts/npm_module_prompt.js');
			ModulePrompt = require('../../../lib/prompts/module_prompt.js');
			themeFinder = require('../../../lib/theme_finder');

			t.end();
		}
	);
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'npm_module_prompt');
});

let prototype;

test.beforeEach(function() {
	prototype = _.create(NPMModulePrompt.prototype);
});

test.afterEach(function() {
	prototypeMethodSpy.flush();
});

test('constructor should pass arguments to init', function(t) {
	let initSpy = prototypeMethodSpy.add(NPMModulePrompt.prototype, 'init');

	new NPMModulePrompt({}, _.noop);

	t.true(initSpy.calledWith({}, _.noop));
});

test('init should assign callback as done property and invoke prompting', function(
	t
) {
	prototype._promptSearchTerms = sinon.spy();

	prototype.init(
		{
			selectedModules: ['module'],
			themelet: true,
		},
		_.noop
	);

	t.true(prototype._promptSearchTerms.calledOnce);
	t.deepEqual(prototype.selectedModules, ['module']);
	t.is(prototype.done, _.noop);
	t.is(prototype.themelet, true);
});

test('_afterPrompt should pass answers to done property', function(t) {
	prototype.done = sinon.spy();

	let answers = {
		module: 'some-module',
	};

	prototype._afterPrompt(answers);

	t.true(prototype.done.calledWith(answers));
});

test('_afterPromptSearchTerms should invoke _getNPMModules with searchTerms', function(
	t
) {
	t.plan(0);

	prototype._getNPMModules = sinon.spy();

	let answers = {
		searchTerms: 'some keyword',
	};

	let cbSpy = sinon.spy();

	prototype._afterPromptSearchTerms(answers, cbSpy);

	prototype._getNPMModules.calledWith(answers.searchTerms, cbSpy);
});

test('_afterPromptSearchTerms should either re-prompt search terms or invoke module prompt', function(
	t
) {
	prototype._getNPMModules = sinon.spy();
	prototype._promptSearchTerms = sinon.spy();
	let logSpy = prototypeMethodSpy.add(gutil, 'log');
	let modulePromptInitSpy = prototypeMethodSpy.add(
		ModulePrompt.prototype,
		'init'
	);

	let answers = {
		searchTerms: 'some keyword',
	};

	prototype._afterPromptSearchTerms(answers);

	let args = prototype._getNPMModules.getCall(0).args;

	t.is(args[0], 'some keyword');

	let cb = args[1];

	cb();

	t.true(logSpy.calledOnce);
	t.true(prototype._promptSearchTerms.calledOnce);

	let modules = {
		'some-module': {},
	};

	cb(modules);

	t.deepEqual(prototype.modules, modules);

	t.true(modulePromptInitSpy.calledOnce);
});

test('_getNPMModules should invoke themeFinder.getLiferayThemeModules', function(
	t
) {
	let getLiferayThemeModulesSpy = prototypeMethodSpy.add(
		themeFinder,
		'getLiferayThemeModules'
	);

	prototype.themelet = 'themelet';

	prototype._getNPMModules('some keyword', _.noop);

	t.true(
		getLiferayThemeModulesSpy.calledWith(
			{
				globalModules: false,
				searchTerms: 'some keyword',
				themelet: 'themelet',
			},
			_.noop
		)
	);
});

test('_promptSearchTerms should prompt for search terms', function(t) {
	let promptSpy = prototypeMethodSpy.add(inquirer, 'prompt');

	let assertAfterPromptSearchTerms = assertBoundFunction(
		prototype,
		'_afterPromptSearchTerms'
	);

	prototype._promptSearchTerms();

	let args = promptSpy.getCall(0).args;

	let question = args[0][0];

	t.true(/themes/.test(question.message));
	t.is(question.name, 'searchTerms');

	assertAfterPromptSearchTerms(args[1]);
});
