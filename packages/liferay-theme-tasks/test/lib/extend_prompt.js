'use strict';

var _ = require('lodash');
var chai = require('chai');
var fs = require('fs-extra');
var lfrThemeConfig = require('../../lib/liferay_theme_config.js');
var os = require('os');
var path = require('path');
var sinon = require('sinon');

var ExtendPrompt;

var assert = chai.assert;
chai.use(require('chai-fs'));

var tempPath = path.join(os.tmpdir(), 'liferay-theme-tasks', '7.0', 'base-theme');

var liferayVersion = '7.0';

var liferayThemeThemletMetaData = {
	themelet: true,
	version: liferayVersion
};

var themeletDependencies = {
	'themelet-1': {
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-1',
		realPath: 'path/to/themelet-1',
		version: liferayVersion
	},
	'themelet-2': {
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-2',
		realPath: 'path/to/themelet-2',
		version: liferayVersion
	},
	'themelet-3': {
		liferayTheme: liferayThemeThemletMetaData,
		name: 'themelet-3',
		realPath: 'path/to/themelet-3',
		version: liferayVersion
	}
};

describe('Extend Prompt', function() {
	var prototype;
	var modifiedPrototypes = [];

	before(function(done) {
		this.timeout(10000);

		var instance = this;

		instance._initCwd = process.cwd();

		fs.copy(path.join(__dirname, '../fixtures/themes/7.0/base-theme'), tempPath, function (err) {
			if (err) throw err;

			process.chdir(tempPath);

			ExtendPrompt = require('../../lib/prompts/extend_prompt');

			instance._buildPath = path.join(tempPath, 'build');
			instance._tempPath = tempPath;

			done();
		});
	});

	beforeEach(function() {
		prototype = _.create(ExtendPrompt.prototype);

		prototype.themeConfig = lfrThemeConfig.getConfig();
	});

	after(function() {
		fs.removeSync(tempPath);

		process.chdir(this._initCwd);
	});

	afterEach(function() {
		ExtendPrompt.prototype._extendableThemes = undefined;
		ExtendPrompt.prototype._extendType = undefined;
	});

	describe('init', function() {
		it('should pass', function() {
			//
		});
	});

	describe('_afterPromptModule', function() {
		it('should use after method which corresponds to addedThemelets properties of answers', function() {
			var answers = {
				module: 'Test'
			};

			prototype._afterPromptTheme = sinon.spy();
			prototype._afterPromptThemelets = sinon.spy();

			prototype._afterPromptModule(answers);

			assert(prototype._afterPromptTheme.calledWith(answers));
			assert.equal(prototype._afterPromptThemelets.callCount, 0);

			answers.addedThemelets = ['some-themelet'];

			prototype._afterPromptModule(answers);

			assert(prototype._afterPromptThemelets.calledWith(answers));
			assert.equal(prototype._afterPromptTheme.callCount, 1);
		});
	});

	describe('_afterPromptTheme', function() {
		it('should save and install new dependencies', function() {
			var removeDependencies = lfrThemeConfig.removeDependencies;
			var setConfig = lfrThemeConfig.setConfig;

			lfrThemeConfig.removeDependencies = sinon.spy();
			lfrThemeConfig.setConfig = sinon.spy();
			prototype._installDependencies = sinon.spy();
			prototype._saveDependencies = sinon.spy();

			var answers = {
				module: 'some-theme',
				modules: {
					'some-theme': {
						liferayTheme: {
							baseTheme: 'styled',
							screenshot: '',
							rubySass: false,
							templateLanguage: 'ftl',
							version: '7.0',
							themeletDependencies: {}
						},
						name: 'some-theme',
						publishConfig: {
							tag: '7_0_x'
						},
						version: '1.0.0'
					}
				}
			};

			prototype._afterPromptTheme(answers);

			assert(lfrThemeConfig.removeDependencies.calledWith(['parent-theme']), 'it removes previous baseTheme from dependencies');

			var setConfigArgs = lfrThemeConfig.setConfig.getCall(0).args[0];

			assert(_.isObject(setConfigArgs.baseTheme.liferayTheme));
			assert.equal(setConfigArgs.baseTheme.version, '1.0.0');

			assert(prototype._saveDependencies.calledWith([setConfigArgs.baseTheme]));

			assert(prototype._installDependencies.calledWith([setConfigArgs.baseTheme]));

			lfrThemeConfig.removeDependencies = removeDependencies;
			lfrThemeConfig.setConfig = setConfig;
		});
	});

	describe('_afterPromptThemelets', function() {
		it('should remove unchecked themelets from package.json and save new themelet dependencies', function() {
			var removeDependencies = lfrThemeConfig.removeDependencies;
			var setConfig = lfrThemeConfig.setConfig;

			lfrThemeConfig.removeDependencies = sinon.spy();
			lfrThemeConfig.setConfig = sinon.spy();
			prototype._installDependencies = sinon.spy();
			prototype._saveDependencies = sinon.spy();

			prototype.themeConfig.themeletDependencies = _.assign({}, {
				'themelet-1': prototype._reducePkgData(themeletDependencies['themelet-1']),
				'themelet-2': prototype._reducePkgData(themeletDependencies['themelet-2'])
			});

			var answers = {
				addedThemelets: ['themelet-3'],
				modules: themeletDependencies,
				removedThemelets: ['themelet-1']
			};

			prototype._afterPromptThemelets(answers);

			assert(lfrThemeConfig.removeDependencies.calledWith(['themelet-1']));

			var reducedThemelets = {
				'themelet-2': prototype._reducePkgData(themeletDependencies['themelet-2']),
				'themelet-3': prototype._reducePkgData(themeletDependencies['themelet-3'])
			}

			assert(lfrThemeConfig.setConfig.calledWith({
				themeletDependencies: reducedThemelets
			}));

			assert(prototype._saveDependencies.calledWith(reducedThemelets));

			assert(prototype._installDependencies.calledWith(reducedThemelets));

			lfrThemeConfig.removeDependencies = removeDependencies;
			lfrThemeConfig.setConfig = setConfig;
		});
	});

	describe('_afterPromptThemeSource', function() {
		it('should set base theme if styled/unstyled', function() {
			var answers = {
				themeSource: 'styled'
			};

			prototype._setStaticBaseTheme = sinon.spy();

			prototype._afterPromptThemeSource(answers);

			assert(prototype._setStaticBaseTheme.getCall(0).calledWith('styled'));

			answers.themeSource = 'unstyled';

			prototype._afterPromptThemeSource(answers);

			assert(prototype._setStaticBaseTheme.getCall(1).calledWith('unstyled'));
		});

		it('should call GlobalModulePrompt', function() {
			var GlobalModulePrompt = require('../../lib/prompts/global_module_prompt');

			modifiedPrototypes.push({
				module: GlobalModulePrompt,
				prototype: _.create(GlobalModulePrompt.prototype)
			});

			var answers = {
				themeSource: 'global'
			};

			GlobalModulePrompt.prototype.init = sinon.spy();
			prototype._afterPromptModule = sinon.spy();

			prototype._afterPromptThemeSource(answers);

			var args = GlobalModulePrompt.prototype.init.getCall(0).args;

			assert.deepEqual(args[0], {
				selectedModules: ['parent-theme'],
				themelet: false
			});

			args[1]();

			assert(prototype._afterPromptModule.calledOnce);
		});

		it('should call NPMModulePrompt', function() {
			var NPMModulePrompt = require('../../lib/prompts/npm_module_prompt');

			modifiedPrototypes.push({
				module: NPMModulePrompt,
				prototype: _.create(NPMModulePrompt.prototype)
			});

			var answers = {
				themeSource: 'npm'
			};

			NPMModulePrompt.prototype.init = sinon.spy();
			prototype._afterPromptModule = sinon.spy();

			prototype._afterPromptThemeSource(answers);

			var args = NPMModulePrompt.prototype.init.getCall(0).args;

			assert.deepEqual(args[0], {
				selectedModules: ['parent-theme'],
				themelet: false
			});

			args[1]();

			assert(prototype._afterPromptModule.calledOnce);
		});
	});

	describe('_filterExtendType', function() {
		it('should set _extendType to input arg', function() {
			prototype._filterExtendType('theme');

			assert.equal(prototype._extendType, 'theme');

			prototype._filterExtendType('themelet');

			assert.equal(prototype._extendType, 'themelet');
		});
	});

	describe('_getDependencyInstallationArray', function() {
		it('should return absolute path if present or name of module', function(done) {
			var dependencies = prototype._getDependencyInstallationArray({
				'themelet-1': {
					liferayTheme: {
						themelet: true,
						version: '*'
					},
					name: 'themelet-1',
					version: '1.0'
				},
				'themelet-2': {
					liferayTheme: {
						themelet: true,
						version: '*'
					},
					name: 'themelet-2',
					path: 'path/to/themelet-2',
					version: '1.0'
				},
				'themelet-3': {
					liferayTheme: {
						themelet: true,
						version: '7.0'
					},
					name: 'themelet-3',
					publishConfig: {
						tag: '7_0_x'
					},
					version: '1.0'
				}
			});

			assert.deepEqual(dependencies, ['themelet-1@*', 'path/to/themelet-2', 'themelet-3@7_0_x']);

			done();
		});
	});

	describe('_getSelectedModules', function() {
		it('should pass', function() {
			prototype.themeConfig = {
				baseTheme: 'styled',
				themeletDependencies: themeletDependencies
			};

			assert.deepEqual(prototype._getSelectedModules(true), ['themelet-1', 'themelet-2', 'themelet-3']);

			assert.equal(prototype._getSelectedModules(false), undefined);

			prototype.themeConfig.baseTheme = {
				name: 'parent-theme'
			};

			assert.deepEqual(prototype._getSelectedModules(false), ['parent-theme']);
		});
	});

	describe('_getThemeSourceChoices', function() {
		it('should return different choices based on _extendType property', function() {
			var choices = prototype._getThemeSourceChoices();

			assert.equal(choices.length, 2);

			prototype._extendType = 'theme';

			choices = prototype._getThemeSourceChoices();

			assert.equal(choices.length, 5);
		});
	});

	describe('_getThemeSourceMessage', function() {
		it('should return appropriate message based on _extendType property', function() {
			var message = prototype._getThemeSourceMessage();

			assert.equal(message, 'Where would you like to search for themelets?');

			prototype._extendType = 'theme';

			message = prototype._getThemeSourceMessage();

			assert.equal(message, 'What base theme would you like to extend?');
		});
	});

	describe('_hasPublishTag', function() {
		it('should return true if publish tag exists', function() {
			assert(!prototype._hasPublishTag({
				publishConfig: {}
			}));

			assert(prototype._hasPublishTag({
				publishConfig: {
					tag: '7_0_x'
				}
			}));
		});
	});

	describe('_installDependencies', function() {
		it('should run child process that installs dependencies', function(done) {
			prototype._installDependencies(themeletDependencies, function(err, data) {
				assert(err.cmd.indexOf('npm install themelet-1@* themelet-2@* themelet-3@*') > -1);

				done();
			});
		});
	});

	describe('_isSupported', function() {
		it('should validate version', function() {
			var version = '7.0';

			assert(!prototype._isSupported('6.2', version));
			assert(!prototype._isSupported(['6.2'], version));
			assert(prototype._isSupported(['6.2', version], version));
			assert(prototype._isSupported(version, version));
		});
	});

	describe('_promptThemeSource', function() {
		it('should prompt correct workflow', function() {
			var inquirer = require('inquirer');

			var prompt = inquirer.prompt;

			inquirer.prompt = sinon.spy();
			prototype._afterPromptThemeSource = sinon.spy();

			var assertFilterExtendType = assertBoundFunction('_filterExtendType', prototype);
			var assertGetThemeSourceChoices = assertBoundFunction('_getThemeSourceChoices', prototype);
			var assertGetThemeSourceMessage = assertBoundFunction('_getThemeSourceMessage', prototype);

			prototype._promptThemeSource();

			var args = inquirer.prompt.getCall(0).args;
			var questions = args[0];

			var extendType = questions[0];

			assert.equal(extendType.name, 'extendType');
			assertFilterExtendType(extendType.filter);

			var themeSource = questions[1];

			assert.equal(themeSource.name, 'themeSource');

			assertGetThemeSourceChoices(themeSource.choices);
			assertGetThemeSourceMessage(themeSource.message);

			args[1]();

			assert(prototype._afterPromptThemeSource.calledOnce);

			inquirer.prompt = prompt;
		});
	});

	describe('_reducePkgData', function() {
		it('should reduce package data to specified set of properties', function() {
			var originalData = {
				liferayTheme: '7.0',
				name: 'name',
				version: '1.1.1',
				publishConfig: {
					tag: 'tag'
				},
				someProp: 'some-value'
			};

			var pkgData = prototype._reducePkgData(originalData);

			delete originalData.someProp;

			assert.deepEqual(pkgData, originalData);

			pkgData = prototype._reducePkgData({
				realPath: '/some/path'
			});

			assert.equal(pkgData.path, '/some/path');
		});
	});

	describe('_saveDependencies', function() {
		it('should save dependencies to package.json', function(done) {
			var updatedData = {
				'lfr-flat-tooltip-themelet': {
					liferayTheme: {
						themelet: true,
						version: '7.0'
					},
					name: 'lfr-flat-tooltip-themelet',
					publishConfig: {
						tag: '7_0_x'
					},
					version: '1.0.0'
				},
				'lfr-link-flip-themelet': {
					liferayTheme: {
						themelet: true,
						version: '*'
					},
					name: 'lfr-link-flip-themelet',
					version: '1.0.1'
				}
			};

			var setDependencies = lfrThemeConfig.setDependencies;

			lfrThemeConfig.setDependencies = sinon.spy();

			prototype._saveDependencies(updatedData);

			assert.equal(lfrThemeConfig.setDependencies.callCount, 1);
			assert(lfrThemeConfig.setDependencies.calledWith({
				'lfr-flat-tooltip-themelet': '7_0_x',
				'lfr-link-flip-themelet': '*'
			}), 'dependencies are saved with correct versioning');

			lfrThemeConfig.setDependencies = setDependencies;

			done();
		});
	});

	describe('_setStaticBaseTheme', function() {
		it('should set static base theme', function() {
			prototype.done = sinon.spy();
			prototype.themeConfig = {
				baseTheme: 'unstyled'
			};

			var setConfig = lfrThemeConfig.setConfig;
			var removeDependencies = lfrThemeConfig.removeDependencies;

			lfrThemeConfig.removeDependencies = sinon.spy();
			lfrThemeConfig.setConfig = sinon.spy();

			prototype._setStaticBaseTheme('styled');

			assert(lfrThemeConfig.setConfig.calledWith({
				baseTheme: 'styled'
			}));
			assert(lfrThemeConfig.removeDependencies.notCalled);

			prototype.themeConfig.baseTheme = {
				name: 'some-theme'
			};

			prototype._setStaticBaseTheme('styled');

			assert(lfrThemeConfig.removeDependencies.calledWith(['some-theme']));

			lfrThemeConfig.setConfig = setConfig;
			lfrThemeConfig.removeDependencies = removeDependencies;
		});
	});
});

function assertBoundFunction(fnName, prototype) {
	prototype[fnName] = sinon.spy();

	return function(fn) {
		fn('argument');

		assert(prototype[fnName].calledOnce);
		assert(prototype[fnName].calledWith('argument'));
	};
}
