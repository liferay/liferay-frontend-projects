/**
 * SPDX-FileCopyrightText: © 2017 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: MIT
 */

const _ = require('lodash');
const sinon = require('sinon');

const project = require('../../../lib/project');
const {
	PrototypeMethodSpy,
	assertBoundFunction,
	cleanTempTheme,
	setupTempTheme,
} = require('../../../lib/test/util');
const ExtendPrompt = require('../extend_prompt');

const prototypeMethodSpy = new PrototypeMethodSpy();

let prototype;
let tempTheme;

beforeEach(() => {
	tempTheme = setupTempTheme({
		namespace: 'extend_prompt',
	});

	prototype = _.create(ExtendPrompt.prototype);
});

afterEach(() => {
	ExtendPrompt.prototype._extendableThemes = undefined;
	ExtendPrompt.prototype._extendType = undefined;
	prototypeMethodSpy.flush();

	cleanTempTheme(tempTheme);
});

it('_afterPromptModule should use after method which corresponds to addedThemelets properties of answers', () => {
	const answers = {
		module: 'Test',
	};

	prototype._afterPromptTheme = sinon.spy();
	prototype._afterPromptThemelets = sinon.spy();

	prototype._afterPromptModule(answers);

	expect(prototype._afterPromptTheme.calledWith(answers)).toBe(true);
	expect(prototype._afterPromptThemelets.callCount).toBe(0);

	answers.addedThemelets = ['some-themelet'];

	prototype._afterPromptModule(answers);

	expect(prototype._afterPromptThemelets.calledWith(answers)).toBe(true);
	expect(prototype._afterPromptTheme.callCount).toBe(1);
});

it('_afterPromptTheme should save and install new dependencies', () => {
	const removeDependencies = project.removeDependencies;
	project.removeDependencies = sinon.spy();

	const {themeConfig} = project;

	const setConfig = themeConfig.setConfig;
	themeConfig.setConfig = sinon.spy();

	prototype._installDependencies = sinon.spy();
	prototype._saveDependencies = sinon.spy();

	const answers = {
		module: 'some-theme',
		modules: {
			'some-theme': {
				liferayTheme: {
					baseTheme: 'styled',
					screenshot: '',
					templateLanguage: 'ftl',
					themeletDependencies: {},
					version: '7.0',
				},
				name: 'some-theme',
				publishConfig: {
					tag: '7_0_x',
				},
				version: '1.0.0',
			},
		},
	};

	prototype._afterPromptTheme(answers);

	expect(project.removeDependencies.calledWith(['parent-theme'])).toBe(true);

	const setConfigArgs = themeConfig.setConfig.getCall(0).args[0];

	expect(_.isObject(setConfigArgs.baseTheme.liferayTheme)).toBe(true);
	expect(setConfigArgs.baseTheme.version).toBe('1.0.0');

	expect(
		prototype._saveDependencies.calledWith([setConfigArgs.baseTheme])
	).toBe(true);

	expect(
		prototype._installDependencies.calledWith([setConfigArgs.baseTheme])
	).toBe(true);

	project.removeDependencies = removeDependencies;
	themeConfig.setConfig = setConfig;
});

it('_afterPromptTheme should end task and not throw error if no module was found', done => {
	prototype.done = done;

	prototype._afterPromptTheme({
		module: null,
		modules: {},
	});
});

it.todo(
	'_afterPromptThemelets should remove unchecked themelets from package.json and save new themelet dependencies'
);

it('_afterPromptThemeSource should set base theme if styled/unstyled', () => {
	const answers = {
		themeSource: 'styled',
	};

	prototype._setStaticBaseTheme = sinon.spy();

	prototype._afterPromptThemeSource(answers);

	expect(prototype._setStaticBaseTheme.getCall(0).calledWith('styled')).toBe(
		true
	);

	answers.themeSource = 'unstyled';

	prototype._afterPromptThemeSource(answers);

	expect(
		prototype._setStaticBaseTheme.getCall(1).calledWith('unstyled')
	).toBe(true);
});

it('_afterPromptThemeSource should call GlobalModulePrompt', () => {
	const GlobalModulePrompt = require('../global_module_prompt');

	const answers = {
		themeSource: 'global',
	};

	const initSpy = prototypeMethodSpy.add(
		GlobalModulePrompt.prototype,
		'init'
	);

	prototype._afterPromptModule = sinon.spy();

	prototype._afterPromptThemeSource(answers);

	const args = initSpy.getCall(0).args;

	expect(args[0]).toEqual({
		selectedModules: ['parent-theme'],
		themelet: false,
	});

	args[1]();

	expect(prototype._afterPromptModule.calledOnce).toBe(true);
});

it('_afterPromptThemeSource should call NPMModulePrompt', () => {
	const NPMModulePrompt = require('../npm_module_prompt');

	const answers = {
		themeSource: 'npm',
	};

	const initSpy = prototypeMethodSpy.add(NPMModulePrompt.prototype, 'init');

	prototype._afterPromptModule = sinon.spy();

	prototype._afterPromptThemeSource(answers);

	const args = initSpy.getCall(0).args;

	expect(args[0]).toEqual({
		selectedModules: ['parent-theme'],
		themelet: false,
	});

	args[1]();

	expect(prototype._afterPromptModule.calledOnce).toBe(true);
});

it('_filterExtendType should set _extendType to input arg', () => {
	prototype._filterExtendType('theme');

	expect(prototype._extendType).toBe('theme');

	prototype._filterExtendType('themelet');

	expect(prototype._extendType).toBe('themelet');
});

it('_getDependencyInstallationArray should return paths, URLs or names', () => {
	const dependencies = prototype._getDependencyInstallationArray({
		'themelet-1': {
			liferayTheme: {
				themelet: true,
				version: '*',
			},
			name: 'themelet-1',
			version: '1.0',
		},
		'themelet-2': {
			__realPath__: 'path/to/themelet-2',
			liferayTheme: {
				themelet: true,
				version: '*',
			},
			name: 'themelet-2',
			version: '1.0',
		},
		'themelet-3': {
			liferayTheme: {
				themelet: true,
				version: '7.1',
			},
			name: 'themelet-3',
			publishConfig: {
				tag: '7_1_x',
			},
			version: '1.0',
		},
		'themelet-4': {
			__packageURL__: 'https://registry.example.org/themelet-4-1.0.0.tgz',
			liferayTheme: {
				themelet: true,
				version: '7.0',
			},
			name: 'themelet-4',
			version: '1.0',
		},
	});

	expect(dependencies).toEqual([
		'themelet-1@*',
		'path/to/themelet-2',
		'themelet-3@7_1_x',
		'https://registry.example.org/themelet-4-1.0.0.tgz',
	]);
});

it.todo('_getSelectedModules works');

it('_getThemeSourceChoices should return different choices based on _extendType property', () => {
	let choices = prototype._getThemeSourceChoices();

	expect(choices.length).toBe(3);

	prototype._extendType = 'theme';

	choices = prototype._getThemeSourceChoices();

	expect(choices).toHaveLength(6);
});

it('_getThemeSourceMessage should return appropriate message based on _extendType property', () => {
	let message = prototype._getThemeSourceMessage();

	expect(message).toBe('Where would you like to search for themelets?');

	prototype._extendType = 'theme';

	message = prototype._getThemeSourceMessage();

	expect(message).toBe('What base theme would you like to extend?');
});

it('_hasPublishTag should return true if publish tag exists', () => {
	expect(
		!prototype._hasPublishTag({
			publishConfig: {},
		})
	).toBe(true);

	expect(
		prototype._hasPublishTag({
			publishConfig: {
				tag: '7_0_x',
			},
		})
	).toBeTruthy();
});

it('_isSupported should validate version', () => {
	const version = '2.0';

	expect(!prototype._isSupported('1.0', version)).toBe(true);
	expect(!prototype._isSupported(['1.0'], version)).toBe(true);
	expect(prototype._isSupported(['1.0', version], version)).toBe(true);
	expect(prototype._isSupported(version, version)).toBe(true);
});

it('_promptThemeSource should prompt correct workflow', () => {
	const inquirer = require('inquirer');

	const prompt = inquirer.prompt;

	inquirer.prompt = sinon.spy();
	prototype._afterPromptThemeSource = sinon.spy();

	const assertFilterExtendType = assertBoundFunction(
		prototype,
		'_filterExtendType'
	);
	const assertGetThemeSourceChoices = assertBoundFunction(
		prototype,
		'_getThemeSourceChoices'
	);
	const assertGetThemeSourceMessage = assertBoundFunction(
		prototype,
		'_getThemeSourceMessage'
	);

	prototype._promptThemeSource();

	const args = inquirer.prompt.getCall(0).args;
	const questions = args[0];

	const extendType = questions[0];

	expect(extendType.name).toBe('extendType');
	assertFilterExtendType(extendType.filter);

	const themeSource = questions[1];

	expect(themeSource.name).toBe('themeSource');

	assertGetThemeSourceChoices(themeSource.choices);
	assertGetThemeSourceMessage(themeSource.message);

	args[1]();

	expect(prototype._afterPromptThemeSource.calledOnce).toBe(true);

	inquirer.prompt = prompt;
});

it('_reducePkgData should reduce package data to specified set of properties', () => {
	const originalData = {
		liferayTheme: '7.0',
		name: 'name',
		publishConfig: {
			tag: 'tag',
		},
		someProp: 'some-value',
		version: '1.1.1',
	};

	let pkgData = prototype._reducePkgData(originalData);

	delete originalData.someProp;

	expect(pkgData).toEqual(originalData);

	pkgData = prototype._reducePkgData({
		__realPath__: '/some/path',
	});

	expect(pkgData.path).toEqual('/some/path');
});

it('_saveDependencies should save dependencies to package.json', () => {
	const updatedData = {
		'lfr-flat-tooltip-themelet': {
			liferayTheme: {
				themelet: true,
				version: '7.1',
			},
			name: 'lfr-flat-tooltip-themelet',
			publishConfig: {
				tag: '7_1_x',
			},
			version: '1.0.0',
		},
		'lfr-link-flip-themelet': {
			liferayTheme: {
				themelet: true,
				version: '*',
			},
			name: 'lfr-link-flip-themelet',
			version: '1.0.1',
		},
	};

	const setDependencies = project.setDependencies;
	project.setDependencies = sinon.spy();

	prototype._saveDependencies(updatedData);

	expect(project.setDependencies.callCount).toBe(1);
	expect(
		project.setDependencies.calledWith({
			'lfr-flat-tooltip-themelet': '7_1_x',
			'lfr-link-flip-themelet': '*',
		})
	).toBe(true);

	project.setDependencies = setDependencies;
});

it.todo('_setStaticBaseTheme should set static base theme');
