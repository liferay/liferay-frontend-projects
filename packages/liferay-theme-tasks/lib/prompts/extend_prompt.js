'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var exec = require('child_process').exec;
var gutil = require('gulp-util');
var inquirer = require('inquirer');

var GlobalModulePrompt = require('./global_module_prompt');
var lfrThemeConfig = require('../liferay_theme_config');
var NPMModulePrompt = require('./npm_module_prompt');
var promptUtil = require('./prompt_util');
var themeFinder = require('../theme_finder');

var moduleName = argv.name;

function ExtendPrompt(config, cb) {
	var instance = this;

	this.themeConfig = config.themeConfig || lfrThemeConfig.getConfig();

	this.done = cb;

	if (moduleName) {
		themeFinder.getLiferayThemeModule(moduleName, function(err, pkg) {
			if (err) throw err;

			var dependencyPropertyName = 'baseTheme';

			if (pkg.liferayTheme.themelet) {
				dependencyPropertyName = 'themeletDependencies';
			}

			var config = _.set({}, dependencyPropertyName + '.' + moduleName, instance._reducePkgData(pkg));

			lfrThemeConfig.setConfig(config);

			instance._saveDependencies(config[dependencyPropertyName]);

			cb();
		});
	}
	else {
		this._promptThemeSource();
	}
}

ExtendPrompt.prototype = {
	_afterPromptModule: function(answers) {
		if (answers.addedThemelets) {
			this._afterPromptThemelets(answers);
		}
		else {
			this._afterPromptTheme(answers);
		}
	},

	_afterPromptTheme: function(answers) {
		var instance = this;

		var baseTheme = this.themeConfig.baseTheme;
		var modulePackages = answers.modules;
		var module = answers.module;

		if (_.isObject(baseTheme)) {
			lfrThemeConfig.removeDependencies([baseTheme.name]);
		}

		var reducedPkg = this._reducePkgData(modulePackages[module]);

		lfrThemeConfig.setConfig({
			baseTheme: reducedPkg
		});

		this._saveDependencies([reducedPkg]);
	},

	_afterPromptThemelets: function(answers) {
		var instance = this;

		var modulePackages = answers.modules;
		var themeletDependencies = this.themeConfig.themeletDependencies || {};

		var reducedThemelets = _.reduce(answers.addedThemelets, function(result, item, index) {
			result[item] = instance._reducePkgData(modulePackages[item]);

			return result;
		}, themeletDependencies);

		var removedThemelets = answers.removedThemelets;

		if (removedThemelets) {
			_.forEach(removedThemelets, function(item, index) {
				delete reducedThemelets[item];
			});

			lfrThemeConfig.removeDependencies(removedThemelets);
		}

		lfrThemeConfig.setConfig({
			themeletDependencies: reducedThemelets
		});

		this._saveDependencies(reducedThemelets);

		this._installDependencies(reducedThemelets);
	},

	_afterPromptThemeSource: function(answers) {
		var themelet = answers.extendType == 'themelet';
		var themeSource = answers.themeSource;

		if (themeSource == 'styled' || themeSource == 'unstyled') {
			this._setStaticBaseTheme(themeSource);
		}
		else {
			var config = {
				selectedModules: this._getSelectedModules(themelet),
				themelet: themelet
			};

			if (themeSource == 'global') {
				new GlobalModulePrompt(config, _.bind(this._afterPromptModule, this));
			}
			else if (themeSource == 'npm') {
				new NPMModulePrompt(config, _.bind(this._afterPromptModule, this));
			}
		}
	},

	_getDependencyInstallationArray: function(dependencies) {
		var instance = this;

		var themeVersion = this.themeConfig.version;

		return _.map(dependencies, function(item, index) {
			var path = item.path;

			return path ? path : item.name + instance._getDistTag(item, themeVersion, '@');
		});
	},

	_getDistTag: function(config, version, prefix) {
		var supportedVersion = config.liferayTheme.version;

		var tag = prefix || '';

		if (this._isSupported(supportedVersion, version) && this._hasPublishTag(config)) {
			tag += version.replace('.', '_') + '_x';
		}
		else {
			tag += '*';
		}

		return tag;
	},

	_getSelectedModules: function(themelet) {
		var selectedModules;

		var baseTheme = this.themeConfig.baseTheme;

		if (themelet) {
			selectedModules = _.map(this.themeConfig.themeletDependencies, function(item, index) {
				return item.name;
			});
		}
		else if (_.isObject(baseTheme)) {
			selectedModules = [baseTheme.name];
		}

		return selectedModules;
	},

	_hasPublishTag: function(config) {
		return config.publishConfig && config.publishConfig.tag;
	},

	_installDependencies: function(dependencies, cb) {
		var modules = this._getDependencyInstallationArray(dependencies);

		var child = exec('npm install ' + modules.join(' '), cb);

		child.stdout.on('data', function(data) {
			process.stdout.write(data);
		});

		child.stderr.on('data', function(data) {
			process.stdout.write(data);
		});
	},

	_isSupported: function(supportedVersion, version) {
		return (_.isArray(supportedVersion) && _.contains(supportedVersion, version)) || supportedVersion == version;
	},

	_promptThemeSource: function(options) {
		var instance = this;

		var listType = promptUtil.getListType();

		inquirer.prompt(
			[
				{
					choices: [
						{
							name: 'Base theme',
							value: 'theme'
						},
						{
							name: 'Themelet',
							value: 'themelet'
						}
					],
					filter: function(input) {
						instance._extendType = input;

						return input;
					},
					message: 'What kind of theme asset would you like to extend?',
					name: 'extendType',
					type: listType
				},
				{
					choices: function() {
						var extendType = instance._extendType;

						var searchOptions = [
							{
								name: 'Search globally installed npm modules',
								value: 'global'
							},
							{
								name: 'Search npm registry (published modules)',
								value: 'npm'
							}
						];

						if (extendType == 'theme') {
							var baseThemeChoices = [
								{
									name: 'Styled',
									value: 'styled'
								},
								{
									name: 'Unstyled',
									value: 'unstyled'
								},
								new inquirer.Separator()
							];

							searchOptions = baseThemeChoices.concat(searchOptions);
						}

						return searchOptions;
					},
					message: function() {
						return instance._extendType == 'theme' ? 'What base theme would you like to extend?' : 'Where would you like to search for themelets?';
					},
					name: 'themeSource',
					type: listType
				}
			],
			_.bind(instance._afterPromptThemeSource, instance)
		);
	},

	_reducePkgData: function(pkg) {
		var realPath = pkg.realPath;

		pkg = _.pick(pkg, ['liferayTheme', 'name', 'publishConfig', 'version']);

		pkg.path = realPath;

		return pkg;
	},

	_saveDependencies: function(updatedData) {
		var instance = this;

		var themeVersion = this.themeConfig.version;

		var dependencies = _.reduce(updatedData, function(result, item, index) {
			var moduleVersion = item.path ? item.path : instance._getDistTag(item, themeVersion);

			result[item.name] = moduleVersion;

			return result;
		}, {});

		lfrThemeConfig.setDependencies(dependencies);
	},

	_setStaticBaseTheme: function(themeSource) {
		var baseTheme = this.themeConfig.baseTheme;

		if (_.isObject(baseTheme)) {
			lfrThemeConfig.removeDependencies([baseTheme.name]);
		}

		lfrThemeConfig.setConfig({
			baseTheme: themeSource
		});

		this.done();
	}
};

module.exports = ExtendPrompt;