'use strict';

var _ = require('lodash');
var argv = require('minimist')(process.argv.slice(2));
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var lfrThemeConfig = require('./liferay_theme_config');
var npm = require('npm');
var themeFinder = require('./theme_finder');

var moduleName = argv.name;

function ExtendPrompt(cb) {
	this.done = cb;

	this._prompt();
}

ExtendPrompt.prototype = {
	_afterPrompt: function(answers) {
		var instance = this;

		instance._removeUnusedDependencies(answers);

		answers = instance._normalizeAnswers(answers);

		lfrThemeConfig.setConfig(answers);

		if (!_.isUndefined(answers.themeletDependencies) || !_.isUndefined(answers.baseTheme)) {
			var updatedData = answers.baseTheme ? answers.baseTheme : answers.themeletDependencies;

			if (answers.baseTheme && _.isObject(answers.baseTheme)) {
				var baseThemeObj = {};

				baseThemeObj[answers.baseTheme.name] = answers.baseTheme;

				updatedData = baseThemeObj;
			}

			if (_.isObject(updatedData)) {
				instance._saveDependencies(updatedData);

				instance._installDependencies(updatedData, function(err, data) {
					if (err) throw err;

					if (instance.done) {
						instance.done();
					}
				});
			}
		}
	},

	_defaultBaseThemeChoices: [
		{
			name: 'Styled',
			value: 'styled'
		},
		{
			name: 'Unstyled',
			value: 'unstyled'
		}
	],

	_extendTypeConditional: function(type) {
		var retVal = (this._extendType == type);

		if (retVal) {
			var empty = _.isEmpty(this._extendableThemes);

			if (empty) {
				gutil.log(gutil.colors.yellow('No ' + type + 's found!'));
			}

			retVal = !empty && _.isUndefined(moduleName);
		}

		return retVal;
	},

	_getThemeletDependenciesFromAnswers: function(answers) {
		var instance = this;

		var extendableThemes = this._extendableThemes;

		var themeletNames = answers.themeletNames || moduleName;

		if (themeletNames && !_.isArray(themeletNames)) {
			themeletNames = [themeletNames];
		}

		var themeletDependencies = _.reduce(themeletNames, function(result, item, index) {
			var extendableTheme = extendableThemes[item];

			if (_.isUndefined(extendableTheme)) {
				instance._handleMissingModule(item, answers, 'themelet');

				return;
			}

			result[item] = {
				liferayTheme: extendableTheme.liferayTheme,
				name: item,
				path: extendableTheme.realPath,
				version: extendableTheme.version
			};

			return result;
		}, {});

		return themeletDependencies;
	},

	_getUnusedDependencies: function(answers) {
		var removedDependencies = [];

		if (answers.baseThemeName) {
			var baseTheme = lfrThemeConfig.getConfig().baseTheme;

			if (_.isObject(baseTheme)) {
				removedDependencies.push(baseTheme.name);
			}
		}

		return removedDependencies.concat(_.difference(this._themeletChoices, answers.themeletNames));
	},

	_handleMissingModule: function(name, answers, type) {
		var message = (answers.extendType == type) ? name + ' not found!' : '';

		gutil.log(gutil.colors.yellow(message));
	},

	_installDependencies: function(dependencies, cb) {
		var modules = this._normalizeDependencies(dependencies);

		npm.load({
			loaded: false
		}, function() {
			npm.commands.install(process.cwd(), modules, cb);
		});
	},

	_normalizeAnswers: function(answers) {
		var baseTheme = this._normalizeBaseTheme(answers);

		if (baseTheme) {
			answers.baseTheme = baseTheme;
		}

		var themeletDependencies = this._normalizeThemeletDependencies(answers);

		if (answers.extendType == 'themelet') {
			answers.themeletDependencies = themeletDependencies;
		}

		answers.baseThemeName = undefined;
		answers.extendType = undefined;
		answers.themeletNames = undefined;
		answers.themeSource = undefined;

		return answers;
	},

	_normalizeBaseTheme: function(answers) {
		var instance = this;

		if (answers.extendType == 'theme') {
			var baseThemeName = answers.baseThemeName || moduleName;

			if (baseThemeName == 'styled' || baseThemeName == 'unstyled') {
				return baseThemeName;
			}
			else if (baseThemeName) {
				var baseTheme = this._extendableThemes[baseThemeName];

				if (_.isUndefined(baseTheme)) {
					instance._handleMissingModule(baseThemeName, answers, 'theme');

					return;
				}

				return {
					liferayTheme: baseTheme.liferayTheme,
					name: baseTheme.name,
					path: baseTheme.realPath,
					version: baseTheme.version
				};
			}
		}
	},

	_normalizeDependencies: function(dependencies) {
		return _.map(dependencies, function(item, index) {
			var path = item.path;

			return path ? path : item.name;
		});
	},

	_normalizeThemeletDependencies: function(answers) {
		var instance = this;

		var globalModules = (answers.themeSource == 'global');

		var savedThemeletDependencies = _.reduce(lfrThemeConfig.getConfig().themeletDependencies, function(result, item, index) {
			var keep = !_.isUndefined(moduleName) || (globalModules && !item.path) || (!globalModules && item.path);

			if (keep) {
				result[index] = item;
			}

			return result;
		}, {});

		var themeletDependencies = instance._getThemeletDependenciesFromAnswers(answers);

		return _.merge(savedThemeletDependencies, themeletDependencies);
	},

	_prompt: function(options) {
		var instance = this;

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
					type: 'list'
				},
				{
					choices: [
						{
							name: 'Globally installed npm modules',
							value: 'global'
						},
						{
							name: 'npm registry (published modules)',
							value: 'npm'
						}
					],
					message: 'Where would you like to search for themes to extend?',
					name: 'themeSource',
					type: 'list',
					filter: function(input) {
						var done = this.async();

						themeFinder.getLiferayThemeModules({
							globalModules: (input == 'global'),
							themelet: (instance._extendType == 'themelet')
						}, function(extendableThemes) {
							instance._extendableThemes = extendableThemes;

							done(input);
						});
					}
				},
				{
					choices: function() {
						var savedThemeletDependencies = lfrThemeConfig.getConfig().themeletDependencies;

						instance._themeletChoices = [];

						return _.map(instance._extendableThemes, function(item, index) {
							var checked = savedThemeletDependencies && (savedThemeletDependencies[item.name]);

							instance._themeletChoices.push(item.name);

							return {
								checked: checked,
								name: item.name,
								value: item.name
							};
						});
					},
					message: 'What themelet would you like to extend?',
					name: 'themeletNames',
					type: 'checkbox',
					when: function(answers) {
						return instance._extendTypeConditional('themelet');
					}
				},
				{
					choices: function(answers) {
						var themeConfig = lfrThemeConfig.getConfig(true);

						var defaultBaseThemeChoices = instance._defaultBaseThemeChoices;

						var extendableThemeChoices = _.reduce(instance._extendableThemes, function(result, item, index) {
							if (themeConfig.name != item.name) {
								result.push({
									name: item.name,
									value: item.name
								});
							}

							return result;
						}, []);

						return defaultBaseThemeChoices.concat(extendableThemeChoices);
					},
					message: 'What base theme would you like to extend?',
					name: 'baseThemeName',
					type: 'list',
					when: function(answers) {
						return instance._extendTypeConditional('theme');
					}
				}
			],
			_.bind(instance._afterPrompt, instance)
		);
	},

	_removeUnusedDependencies: function(answers) {
		lfrThemeConfig.removeDependencies(this._getUnusedDependencies(answers));
	},

	_saveDependencies: function(updatedData) {
		var dependencies = _.reduce(updatedData, function(result, item, index) {
			var moduleVersion = item.path ? item.path : '^' + item.version;

			result[item.name] = moduleVersion;

			return result;
		}, {});

		lfrThemeConfig.setConfig(dependencies, true);
	}
};

module.exports = ExtendPrompt;