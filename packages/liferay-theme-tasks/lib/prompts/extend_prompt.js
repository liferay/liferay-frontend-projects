'use strict';

let _ = require('lodash');
let argv = require('minimist')(process.argv.slice(2));
let exec = require('child_process').exec;
let inquirer = require('inquirer');

let GlobalModulePrompt = require('./global_module_prompt');
let lfrThemeConfig = require('../liferay_theme_config');
let NPMModulePrompt = require('./npm_module_prompt');
let promptUtil = require('./prompt_util');
let themeFinder = require('../theme_finder');

let moduleName = argv.name;

function ExtendPrompt() {
	this.init.apply(this, arguments);
}

ExtendPrompt.prototype = {
	init: function(config, cb) {
		let instance = this;

		this.themeConfig = config.themeConfig || lfrThemeConfig.getConfig();

		this.done = cb;

		if (moduleName) {
			themeFinder.getLiferayThemeModule(moduleName, function(err, pkg) {
				if (err) {
					throw err;
				}

				let modules = {};

				modules[moduleName] = pkg;

				if (pkg.liferayTheme.themelet) {
					instance._afterPromptThemelets({
						addedThemelets: [moduleName],
						modules: modules,
					});
				} else {
					instance._afterPromptTheme({
						module: moduleName,
						modules: modules,
					});
				}
			});
		} else {
			this._promptThemeSource();
		}
	},

	_afterPromptModule: function(answers) {
		if (answers.addedThemelets) {
			this._afterPromptThemelets(answers);
		} else {
			this._afterPromptTheme(answers);
		}
	},

	_afterPromptTheme: function(answers) {
		let instance = this;

		let baseTheme = this.themeConfig.baseTheme;
		let module = answers.module;
		let modulePackages = answers.modules;

		if (!module) {
			instance.done();

			return;
		}

		if (_.isObject(baseTheme)) {
			lfrThemeConfig.removeDependencies([baseTheme.name]);
		}

		let reducedPkg = this._reducePkgData(modulePackages[module]);

		lfrThemeConfig.setConfig({
			baseTheme: reducedPkg,
		});

		this._saveDependencies([reducedPkg]);

		this._installDependencies([reducedPkg], function() {
			instance.done();
		});
	},

	_afterPromptThemelets: function(answers) {
		let instance = this;

		let modulePackages = answers.modules;
		let themeletDependencies = this.themeConfig.themeletDependencies || {};

		let reducedThemelets = _.reduce(
			answers.addedThemelets,
			function(result, item) {
				result[item] = instance._reducePkgData(modulePackages[item]);

				return result;
			},
			themeletDependencies
		);

		let removedThemelets = answers.removedThemelets;

		if (removedThemelets) {
			_.forEach(removedThemelets, function(item) {
				delete reducedThemelets[item];
			});

			lfrThemeConfig.removeDependencies(removedThemelets);
		}

		lfrThemeConfig.setConfig({
			themeletDependencies: reducedThemelets,
		});

		this._saveDependencies(reducedThemelets);

		if (answers.addedThemelets.length) {
			this._installDependencies(reducedThemelets, function() {
				instance.done();
			});
		} else {
			instance.done();
		}
	},

	_afterPromptThemeSource: function(answers) {
		let themelet = answers.extendType === 'themelet';
		let themeSource = answers.themeSource;

		if (themeSource === 'styled' || themeSource === 'unstyled') {
			this._setStaticBaseTheme(themeSource);
		} else {
			let config = {
				selectedModules: this._getSelectedModules(themelet),
				themelet: themelet,
			};

			if (themeSource === 'global') {
				GlobalModulePrompt.prompt(
					config,
					_.bind(this._afterPromptModule, this)
				);
			} else if (themeSource === 'npm') {
				NPMModulePrompt.prompt(
					config,
					_.bind(this._afterPromptModule, this)
				);
			}
		}
	},

	_filterExtendType: function(input) {
		this._extendType = input;

		return input;
	},

	_getDependencyInstallationArray: function(dependencies) {
		let instance = this;

		let themeVersion = this.themeConfig.version;

		return _.map(dependencies, function(item) {
			let path = item.path;

			return path
				? path
				: item.name + instance._getDistTag(item, themeVersion, '@');
		});
	},

	_getDistTag: function(config, version, prefix) {
		let supportedVersion = config.liferayTheme.version;

		let tag = prefix || '';

		if (
			this._isSupported(supportedVersion, version) &&
			this._hasPublishTag(config)
		) {
			tag += version.replace('.', '_') + '_x';
		} else {
			tag += '*';
		}

		return tag;
	},

	_getSelectedModules: function(themelet) {
		let selectedModules;

		let baseTheme = this.themeConfig.baseTheme;

		if (themelet) {
			selectedModules = _.map(
				this.themeConfig.themeletDependencies,
				function(item) {
					return item.name;
				}
			);
		} else if (_.isObject(baseTheme)) {
			selectedModules = [baseTheme.name];
		}

		return selectedModules;
	},

	_getThemeSourceChoices: function() {
		let extendType = this._extendType;

		let searchOptions = [
			{
				name:
					'Search globally installed npm modules (development purposes only)',
				value: 'global',
			},
			{
				name: 'Search npm registry (published modules)',
				value: 'npm',
			},
		];

		if (extendType === 'theme') {
			let baseThemeChoices = [
				{
					name: 'Styled',
					value: 'styled',
				},
				{
					name: 'Unstyled',
					value: 'unstyled',
				},
				new inquirer.Separator(),
			];

			searchOptions = baseThemeChoices.concat(searchOptions);
		}

		return searchOptions;
	},

	_getThemeSourceMessage: function() {
		return this._extendType === 'theme'
			? 'What base theme would you like to extend?'
			: 'Where would you like to search for themelets?';
	},

	_hasPublishTag: function(config) {
		return config.publishConfig && config.publishConfig.tag;
	},

	_installDependencies: function(dependencies, cb) {
		let modules = this._getDependencyInstallationArray(dependencies);

		let child = exec('npm install ' + modules.join(' '), cb);

		child.stderr.pipe(process.stdout);
		child.stdout.pipe(process.stdout);
	},

	_isSupported: function(supportedVersion, version) {
		return (
			(_.isArray(supportedVersion) &&
				_.contains(supportedVersion, version)) ||
			supportedVersion === version
		);
	},

	_promptThemeSource: function() {
		let instance = this;

		let listType = promptUtil.getListType();

		inquirer.prompt(
			[
				{
					choices: [
						{
							name: 'Base theme',
							value: 'theme',
						},
						{
							name: 'Themelet',
							value: 'themelet',
						},
					],
					filter: _.bind(instance._filterExtendType, instance),
					message:
						'What kind of theme asset would you like to extend?',
					name: 'extendType',
					type: listType,
				},
				{
					choices: _.bind(instance._getThemeSourceChoices, instance),
					message: _.bind(instance._getThemeSourceMessage, instance),
					name: 'themeSource',
					type: listType,
				},
			],
			_.bind(instance._afterPromptThemeSource, instance)
		);
	},

	_reducePkgData: function(pkg) {
		let realPath = pkg.realPath;

		pkg = _.pick(pkg, ['liferayTheme', 'name', 'publishConfig', 'version']);

		if (realPath) {
			pkg.path = realPath;
		}

		return pkg;
	},

	_saveDependencies: function(updatedData) {
		let instance = this;

		let themeVersion = this.themeConfig.version;

		let dependencies = _.reduce(
			updatedData,
			function(result, item) {
				let moduleVersion = item.path
					? item.path
					: instance._getDistTag(item, themeVersion);

				result[item.name] = moduleVersion;

				return result;
			},
			{}
		);

		lfrThemeConfig.setDependencies(dependencies);
	},

	_setStaticBaseTheme: function(themeSource) {
		let baseTheme = this.themeConfig.baseTheme;

		if (_.isObject(baseTheme)) {
			lfrThemeConfig.removeDependencies([baseTheme.name]);
		}

		lfrThemeConfig.setConfig({
			baseTheme: themeSource,
		});

		this.done();
	},
};

ExtendPrompt.prompt = function(config, cb) {
	return new ExtendPrompt(config, cb);
};

module.exports = ExtendPrompt;
