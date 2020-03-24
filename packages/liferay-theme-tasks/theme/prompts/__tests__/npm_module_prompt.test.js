/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const inquirer = require('inquirer');
const _ = require('lodash');
const sinon = require('sinon');

const {
	PrototypeMethodSpy,
	assertBoundFunction,
	cleanTempTheme,
	setupTempTheme,
} = require('../../../lib/test/util');
const themeFinder = require('../../lib/theme_finder');
const ModulePrompt = require('../module_prompt');
const NPMModulePrompt = require('../npm_module_prompt');

const prototypeMethodSpy = new PrototypeMethodSpy();

let prototype;
let tempTheme;

beforeEach(() => {
	tempTheme = setupTempTheme({
		namespace: 'npm_module_prompt',
	});

	prototype = _.create(NPMModulePrompt.prototype);
});

afterEach(() => {
	prototypeMethodSpy.flush();

	cleanTempTheme(tempTheme);
});

it('constructor should pass arguments to init', () => {
	const initSpy = prototypeMethodSpy.add(NPMModulePrompt.prototype, 'init');

	new NPMModulePrompt({}, _.noop);

	expect(initSpy.calledWith({}, _.noop)).toBe(true);
});

it('init should assign callback as done property and invoke prompting', () => {
	prototype._promptSearchTerms = sinon.spy();

	prototype.init(
		{
			selectedModules: ['module'],
			themelet: true,
		},
		_.noop
	);

	expect(prototype._promptSearchTerms.calledOnce).toBe(true);
	expect(prototype.selectedModules).toEqual(['module']);
	expect(prototype.done).toBe(_.noop);
	expect(prototype.themelet).toBe(true);
});

it('_afterPrompt should pass answers to done property', () => {
	prototype.done = sinon.spy();

	const answers = {
		module: 'some-module',
	};

	prototype._afterPrompt(answers);

	expect(prototype.done.calledWith(answers)).toBe(true);
});

it('_afterPromptSearchTerms should invoke _getNPMModules with searchTerms', () => {
	prototype._getNPMModules = sinon.spy();

	const answers = {
		searchTerms: 'some keyword',
	};

	const cbSpy = sinon.spy();

	prototype._afterPromptSearchTerms(answers, cbSpy);

	prototype._getNPMModules.calledWith(answers.searchTerms, cbSpy);
});

it('_afterPromptSearchTerms should either re-prompt search terms or invoke module prompt', () => {
	prototype._getNPMModules = sinon.spy();
	prototype._promptSearchTerms = sinon.spy();

	const modulePromptInitSpy = prototypeMethodSpy.add(
		ModulePrompt.prototype,
		'init'
	);

	const answers = {
		searchTerms: 'some keyword',
	};

	prototype._afterPromptSearchTerms(answers);

	const args = prototype._getNPMModules.getCall(0).args;

	expect(args[0]).toBe('some keyword');

	const cb = args[1];

	cb();

	expect(prototype._promptSearchTerms.calledOnce).toBe(true);

	const modules = {
		'some-module': {},
	};

	cb(modules);

	expect(prototype.modules).toEqual(modules);

	expect(modulePromptInitSpy.calledOnce).toBe(true);
});

it('_getNPMModules should invoke themeFinder.getLiferayThemeModules', () => {
	const getLiferayThemeModulesSpy = prototypeMethodSpy.add(
		themeFinder,
		'getLiferayThemeModules'
	);

	prototype.themelet = 'themelet';

	prototype._getNPMModules('some keyword', _.noop);

	expect(
		getLiferayThemeModulesSpy.calledWith(
			{
				globalModules: false,
				searchTerms: 'some keyword',
				themelet: 'themelet',
			},
			_.noop
		)
	).toBe(true);
});

it('_promptSearchTerms should prompt for search terms', () => {
	const promptSpy = prototypeMethodSpy.add(inquirer, 'prompt');

	const assertAfterPromptSearchTerms = assertBoundFunction(
		prototype,
		'_afterPromptSearchTerms'
	);

	prototype._promptSearchTerms();

	const args = promptSpy.getCall(0).args;

	const question = args[0][0];

	expect(/themes/.test(question.message)).toBe(true);
	expect(question.name).toBe('searchTerms');

	assertAfterPromptSearchTerms(args[1]);
});
