'use strict';

let _ = require('lodash');
let sinon = require('sinon');
let test = require('ava');

let lfrThemeConfig = require('../../../lib/liferay_theme_config.js');
let testUtil = require('../../util.js');

let ExtendPrompt;

let assertBoundFunction = testUtil.assertBoundFunction;
let prototypeMethodSpy = new testUtil.PrototypeMethodSpy();

let liferayVersion = '7.0';

let liferayThemeThemletMetaData = {
	themelet: true,
	version: liferayVersion,
};

let themeletDependencies = {
	'themelet-1': {
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-1',
		realPath: 'path/to/themelet-1',
		version: liferayVersion,
	},
	'themelet-2': {
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-2',
		realPath: 'path/to/themelet-2',
		version: liferayVersion,
	},
	'themelet-3': {
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-3',
		realPath: 'path/to/themelet-3',
		version: liferayVersion,
	},
};

let initCwd = process.cwd();

test.cb.before(function(t) {
	testUtil.copyTempTheme(
		{
			namespace: 'extend_prompt',
		},
		function(config) {
			ExtendPrompt = require('../../../lib/prompts/extend_prompt');

			t.end();
		}
	);
});

test.after(function() {
	process.chdir(initCwd);

	testUtil.cleanTempTheme('base-theme', '7.0', 'extend_prompt');
});

let prototype;

test.beforeEach(function() {
	prototype = _.create(ExtendPrompt.prototype);

	prototype.themeConfig = lfrThemeConfig.getConfig();
});

test.afterEach(function() {
	ExtendPrompt.prototype._extendableThemes = undefined;
	ExtendPrompt.prototype._extendType = undefined;

	prototypeMethodSpy.flush();
});

test('_afterPromptModule should use after method which corresponds to addedThemelets properties of answers', function(
	t
) {
	let answers = {
		module: 'Test',
	};

	prototype._afterPromptTheme = sinon.spy();
	prototype._afterPromptThemelets = sinon.spy();

	prototype._afterPromptModule(answers);

	t.true(prototype._afterPromptTheme.calledWith(answers));
	t.is(prototype._afterPromptThemelets.callCount, 0);

	answers.addedThemelets = ['some-themelet'];

	prototype._afterPromptModule(answers);

	t.true(prototype._afterPromptThemelets.calledWith(answers));
	t.is(prototype._afterPromptTheme.callCount, 1);
});

test('_afterPromptTheme should save and install new dependencies', function(t) {
	let removeDependencies = lfrThemeConfig.removeDependencies;
	let setConfig = lfrThemeConfig.setConfig;

	lfrThemeConfig.removeDependencies = sinon.spy();
	lfrThemeConfig.setConfig = sinon.spy();
	prototype._installDependencies = sinon.spy();
	prototype._saveDependencies = sinon.spy();

	let answers = {
		module: 'some-theme',
		modules: {
			'some-theme': {
				liferayTheme: {
					baseTheme: 'styled',
					screenshot: '',
					rubySass: false,
					templateLanguage: 'ftl',
					version: '7.0',
					themeletDependencies: {},
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

	t.true(
		lfrThemeConfig.removeDependencies.calledWith(['parent-theme']),
		'it removes previous baseTheme from dependencies'
	);

	let setConfigArgs = lfrThemeConfig.setConfig.getCall(0).args[0];

	t.true(_.isObject(setConfigArgs.baseTheme.liferayTheme));
	t.is(setConfigArgs.baseTheme.version, '1.0.0');

	t.true(prototype._saveDependencies.calledWith([setConfigArgs.baseTheme]));

	t.true(
		prototype._installDependencies.calledWith([setConfigArgs.baseTheme])
	);

	lfrThemeConfig.removeDependencies = removeDependencies;
	lfrThemeConfig.setConfig = setConfig;
});

test.cb(
	'_afterPromptTheme should end task and not throw error if no module was found',
	function(t) {
		prototype.done = t.end;

		prototype._afterPromptTheme({
			module: null,
			modules: {},
		});
	}
);

test('_afterPromptThemelets should remove unchecked themelets from package.json and save new themelet dependencies', function(
	t
) {
	let removeDependencies = lfrThemeConfig.removeDependencies;
	let setConfig = lfrThemeConfig.setConfig;

	lfrThemeConfig.removeDependencies = sinon.spy();
	lfrThemeConfig.setConfig = sinon.spy();
	prototype._installDependencies = sinon.spy();
	prototype._saveDependencies = sinon.spy();

	prototype.themeConfig.themeletDependencies = _.assign(
		{},
		{
			'themelet-1': prototype._reducePkgData(
				themeletDependencies['themelet-1']
			),
			'themelet-2': prototype._reducePkgData(
				themeletDependencies['themelet-2']
			),
		}
	);

	let answers = {
		addedThemelets: ['themelet-3'],
		modules: themeletDependencies,
		removedThemelets: ['themelet-1'],
	};

	prototype._afterPromptThemelets(answers);

	t.true(lfrThemeConfig.removeDependencies.calledWith(['themelet-1']));

	let reducedThemelets = {
		'themelet-2': prototype._reducePkgData(
			themeletDependencies['themelet-2']
		),
		'themelet-3': prototype._reducePkgData(
			themeletDependencies['themelet-3']
		),
	};

	t.true(
		lfrThemeConfig.setConfig.calledWith({
			themeletDependencies: reducedThemelets,
		})
	);

	t.true(prototype._saveDependencies.calledWith(reducedThemelets));

	t.true(prototype._installDependencies.calledWith(reducedThemelets));

	lfrThemeConfig.removeDependencies = removeDependencies;
	lfrThemeConfig.setConfig = setConfig;
});

test('_afterPromptThemeSource should set base theme if styled/unstyled', function(
	t
) {
	let answers = {
		themeSource: 'styled',
	};

	prototype._setStaticBaseTheme = sinon.spy();

	prototype._afterPromptThemeSource(answers);

	t.true(prototype._setStaticBaseTheme.getCall(0).calledWith('styled'));

	answers.themeSource = 'unstyled';

	prototype._afterPromptThemeSource(answers);

	t.true(prototype._setStaticBaseTheme.getCall(1).calledWith('unstyled'));
});

test('_afterPromptThemeSource should call GlobalModulePrompt', function(t) {
	let GlobalModulePrompt = require('../../../lib/prompts/global_module_prompt');

	let answers = {
		themeSource: 'global',
	};

	GlobalModulePrompt;

	let initSpy = prototypeMethodSpy.add(GlobalModulePrompt.prototype, 'init');

	prototype._afterPromptModule = sinon.spy();

	prototype._afterPromptThemeSource(answers);

	let args = initSpy.getCall(0).args;

	t.deepEqual(args[0], {
		selectedModules: ['parent-theme'],
		themelet: false,
	});

	args[1]();

	t.true(prototype._afterPromptModule.calledOnce);
});

test('_afterPromptThemeSource should call NPMModulePrompt', function(t) {
	let NPMModulePrompt = require('../../../lib/prompts/npm_module_prompt');

	let answers = {
		themeSource: 'npm',
	};

	let initSpy = prototypeMethodSpy.add(NPMModulePrompt.prototype, 'init');

	prototype._afterPromptModule = sinon.spy();

	prototype._afterPromptThemeSource(answers);

	let args = initSpy.getCall(0).args;

	t.deepEqual(args[0], {
		selectedModules: ['parent-theme'],
		themelet: false,
	});

	args[1]();

	t.true(prototype._afterPromptModule.calledOnce);
});

test('_filterExtendType should set _extendType to input arg', function(t) {
	prototype._filterExtendType('theme');

	t.is(prototype._extendType, 'theme');

	prototype._filterExtendType('themelet');

	t.is(prototype._extendType, 'themelet');
});

test('_getDependencyInstallationArray should return absolute path if present or name of module', function(
	t
) {
	let dependencies = prototype._getDependencyInstallationArray({
		'themelet-1': {
			liferayTheme: {
				themelet: true,
				version: '*',
			},
			name: 'themelet-1',
			version: '1.0',
		},
		'themelet-2': {
			liferayTheme: {
				themelet: true,
				version: '*',
			},
			name: 'themelet-2',
			path: 'path/to/themelet-2',
			version: '1.0',
		},
		'themelet-3': {
			liferayTheme: {
				themelet: true,
				version: '7.0',
			},
			name: 'themelet-3',
			publishConfig: {
				tag: '7_0_x',
			},
			version: '1.0',
		},
	});

	t.deepEqual(dependencies, [
		'themelet-1@*',
		'path/to/themelet-2',
		'themelet-3@7_0_x',
	]);
});

test('_getSelectedModules should pass', function(t) {
	prototype.themeConfig = {
		baseTheme: 'styled',
		themeletDependencies: themeletDependencies,
	};

	t.deepEqual(prototype._getSelectedModules(true), [
		'themelet-1',
		'themelet-2',
		'themelet-3',
	]);

	t.is(prototype._getSelectedModules(false), undefined);

	prototype.themeConfig.baseTheme = {
		name: 'parent-theme',
	};

	t.deepEqual(prototype._getSelectedModules(false), ['parent-theme']);
});

test('_getThemeSourceChoices should return different choices based on _extendType property', function(
	t
) {
	let choices = prototype._getThemeSourceChoices();

	t.is(choices.length, 2);

	prototype._extendType = 'theme';

	choices = prototype._getThemeSourceChoices();

	t.is(choices.length, 5);
});

test('_getThemeSourceMessage should return appropriate message based on _extendType property', function(
	t
) {
	let message = prototype._getThemeSourceMessage();

	t.is(message, 'Where would you like to search for themelets?');

	prototype._extendType = 'theme';

	message = prototype._getThemeSourceMessage();

	t.is(message, 'What base theme would you like to extend?');
});

test('_hasPublishTag should return true if publish tag exists', function(t) {
	t.true(
		!prototype._hasPublishTag({
			publishConfig: {},
		})
	);

	t.truthy(
		prototype._hasPublishTag({
			publishConfig: {
				tag: '7_0_x',
			},
		})
	);
});

test.cb(
	'_installDependencies should run child process that installs dependencies',
	function(t) {
		prototype._installDependencies(themeletDependencies, function(
			err,
			data
		) {
			if (err.cmd) {
				t.true(
					err.cmd.indexOf(
						'npm install themelet-1@* themelet-2@* themelet-3@*'
					) > -1
				);
			}

			t.end();
		});
	}
);

test('_isSupported should validate version', function(t) {
	let version = '2.0';

	t.true(!prototype._isSupported('1.0', version));
	t.true(!prototype._isSupported(['1.0'], version));
	t.true(prototype._isSupported(['1.0', version], version));
	t.true(prototype._isSupported(version, version));
});

test('_promptThemeSource should prompt correct workflow', function(t) {
	let inquirer = require('inquirer');

	let prompt = inquirer.prompt;

	inquirer.prompt = sinon.spy();
	prototype._afterPromptThemeSource = sinon.spy();

	let assertFilterExtendType = assertBoundFunction(
		prototype,
		'_filterExtendType'
	);
	let assertGetThemeSourceChoices = assertBoundFunction(
		prototype,
		'_getThemeSourceChoices'
	);
	let assertGetThemeSourceMessage = assertBoundFunction(
		prototype,
		'_getThemeSourceMessage'
	);

	prototype._promptThemeSource();

	let args = inquirer.prompt.getCall(0).args;
	let questions = args[0];

	let extendType = questions[0];

	t.is(extendType.name, 'extendType');
	assertFilterExtendType(extendType.filter);

	let themeSource = questions[1];

	t.is(themeSource.name, 'themeSource');

	assertGetThemeSourceChoices(themeSource.choices);
	assertGetThemeSourceMessage(themeSource.message);

	args[1]();

	t.true(prototype._afterPromptThemeSource.calledOnce);

	inquirer.prompt = prompt;
});

test('_reducePkgData should reduce package data to specified set of properties', function(
	t
) {
	let originalData = {
		liferayTheme: '7.0',
		name: 'name',
		version: '1.1.1',
		publishConfig: {
			tag: 'tag',
		},
		someProp: 'some-value',
	};

	let pkgData = prototype._reducePkgData(originalData);

	delete originalData.someProp;

	t.deepEqual(pkgData, originalData);

	pkgData = prototype._reducePkgData({
		realPath: '/some/path',
	});

	t.is(pkgData.path, '/some/path');
});

test('_saveDependencies should save dependencies to package.json', function(t) {
	let updatedData = {
		'lfr-flat-tooltip-themelet': {
			liferayTheme: {
				themelet: true,
				version: '7.0',
			},
			name: 'lfr-flat-tooltip-themelet',
			publishConfig: {
				tag: '7_0_x',
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

	let setDependencies = lfrThemeConfig.setDependencies;

	lfrThemeConfig.setDependencies = sinon.spy();

	prototype._saveDependencies(updatedData);

	t.is(lfrThemeConfig.setDependencies.callCount, 1);
	t.true(
		lfrThemeConfig.setDependencies.calledWith({
			'lfr-flat-tooltip-themelet': '7_0_x',
			'lfr-link-flip-themelet': '*',
		}),
		'dependencies are saved with correct versioning'
	);

	lfrThemeConfig.setDependencies = setDependencies;
});

test('_setStaticBaseTheme should set static base theme', function(t) {
	prototype.done = sinon.spy();
	prototype.themeConfig = {
		baseTheme: 'unstyled',
	};

	let setConfig = lfrThemeConfig.setConfig;
	let removeDependencies = lfrThemeConfig.removeDependencies;

	lfrThemeConfig.removeDependencies = sinon.spy();
	lfrThemeConfig.setConfig = sinon.spy();

	prototype._setStaticBaseTheme('styled');

	t.true(
		lfrThemeConfig.setConfig.calledWith({
			baseTheme: 'styled',
		})
	);
	t.true(lfrThemeConfig.removeDependencies.notCalled);

	prototype.themeConfig.baseTheme = {
		name: 'some-theme',
	};

	prototype._setStaticBaseTheme('styled');

	t.true(lfrThemeConfig.removeDependencies.calledWith(['some-theme']));

	lfrThemeConfig.setConfig = setConfig;
	lfrThemeConfig.removeDependencies = removeDependencies;
});
