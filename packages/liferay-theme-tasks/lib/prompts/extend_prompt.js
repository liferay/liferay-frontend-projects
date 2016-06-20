'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var exec = require('child_process').exec;
var inquirer = require('inquirer');

var GlobalModulePrompt = require('./global_module_prompt');
var lfrThemeConfig = require('../liferay_theme_config');
var NPMModulePrompt = require('./npm_module_prompt');
var promptUtil = require('./prompt_util');
var themeFinder = require('../theme_finder');

var moduleName = argv.name;

function ExtendPrompt() {
	this.init.apply(this, arguments);
}

ExtendPrompt.prototype = {
	init: function(config, cb) {
		var instance = this;

		this.themeConfig = config.themeConfig || lfrThemeConfig.getConfig();

		this.done = cb;

		if (moduleName) {
			themeFinder.getLiferayThemeModule(moduleName, function(err, pkg) {
				if (err) {
					throw err;
				}

				var modules = {};

				modules[moduleName] = pkg;

				if (pkg.liferayTheme.themelet) {
					instance._afterPromptThemelets({
						addedThemelets: [moduleName],
						modules: modules
					});
				}
				else {
					instance._afterPromptTheme({
						module: moduleName,
						modules: modules
					});
				}
			});
		}
		else {
			this._promptThemeSource();
		}
	},

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

		this._installDependencies([reducedPkg], function() {
			instance.done();
		});
	},

	_afterPromptThemelets: function(answers) {
		var instance = this;

		var modulePackages = answers.modules;
		var themeletDependencies = this.themeConfig.themeletDependencies || {};

		var reducedThemelets = _.reduce(answers.addedThemelets, function(result, item) {
			result[item] = instance._reducePkgData(modulePackages[item]);

			return result;
		}, themeletDependencies);

		var removedThemelets = answers.removedThemelets;

		if (removedThemelets) {
			_.forEach(removedThemelets, function(item) {
				delete reducedThemelets[item];
			});

			lfrThemeConfig.removeDependencies(removedThemelets);
		}

		lfrThemeConfig.setConfig({
			themeletDependencies: reducedThemelets
		});

		this._saveDependencies(reducedThemelets);

		if (answers.addedThemelets.length) {
			this._installDependencies(reducedThemelets, function() {
				instance.done();
			});
		}
		else {
			instance.done();
		}
	},

	_afterPromptThemeSource: function(answers) {
		var themelet = answers.extendType === 'themelet';
		var themeSource = answers.themeSource;

		if (themeSource === 'styled' || themeSource === 'unstyled') {
			this._setStaticBaseTheme(themeSource);
		}
		else {
			var config = {
				selectedModules: this._getSelectedModules(themelet),
				themelet: themelet
			};

			if (themeSource === 'global') {
				new GlobalModulePrompt(config, _.bind(this._afterPromptModule, this));
			}
			else if (themeSource === 'npm') {
				new NPMModulePrompt(config, _.bind(this._afterPromptModule, this));
			}
		}
	},

	_filterExtendType: function(input) {
		this._extendType = input;

		return input;
	},

	_getDependencyInstallationArray: function(dependencies) {
		var instance = this;

		var themeVersion = this.themeConfig.version;

		return _.map(dependencies, function(item) {
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
			selectedModules = _.map(this.themeConfig.themeletDependencies, function(item) {
				return item.name;
			});
		}
		else if (_.isObject(baseTheme)) {
			selectedModules = [baseTheme.name];
		}

		return selectedModules;
	},

	_getThemeSourceChoices: function() {
		var extendType = this._extendType;

		var searchOptions = [
			{
				name: 'Search globally installed npm modules (development purposes only)',
				value: 'global'
			},
			{
				name: 'Search npm registry (published modules)',
				value: 'npm'
			}
		];

		if (extendType === 'theme') {
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

	_getThemeSourceMessage: function() {
		return this._extendType === 'theme' ? 'What base theme would you like to extend?' : 'Where would you like to search for themelets?';
	},

	_hasPublishTag: function(config) {
		return config.publishConfig && config.publishConfig.tag;
	},

	_installDependencies: function(dependencies, cb) {
		var modules = this._getDependencyInstallationArray(dependencies);

		var child = exec('npm install ' + modules.join(' '), cb);

		child.stderr.pipe(process.stdout);
		child.stdout.pipe(process.stdout);
	},

	_isSupported: function(supportedVersion, version) {
		return (_.isArray(supportedVersion) && _.contains(supportedVersion, version)) || supportedVersion === version;
	},

	_promptThemeSource: function() {
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
					filter: _.bind(instance._filterExtendType, instance),
					message: 'What kind of theme asset would you like to extend?',
					name: 'extendType',
					type: listType
				},
				{
					choices: _.bind(instance._getThemeSourceChoices, instance),
					message: _.bind(instance._getThemeSourceMessage, instance),
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

		if (realPath) {
			pkg.path = realPath;
		}

		return pkg;
	},

	_saveDependencies: function(updatedData) {
		var instance = this;

		var themeVersion = this.themeConfig.version;

		var dependencies = _.reduce(updatedData, function(result, item) {
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
