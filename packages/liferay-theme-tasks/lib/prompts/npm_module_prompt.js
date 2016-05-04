'use strict';

var _ = require('lodash');
var gutil = require('gulp-util');
var inquirer = require('inquirer');

var promptUtil = require('./prompt_util');
var themeFinder = require('../theme_finder');

function NPMModulePrompt(config, cb) {
	this.selectedModules = config.selectedModules;
	this.themelet = config.themelet;

	this.done = cb;

	this._promptSearchTerms();
}

NPMModulePrompt.prototype = {
	_afterPrompt: function(answers) {
		if (this.themelet) {
			_.assign(answers, promptUtil.formatThemeletSelection(answers.module, this.selectedModules));
		}

		answers.modules = this._modules;

		this.done(answers);
	},

	_afterPromptSearchTerms: function(answers) {
		var instance = this;

		var themelet = this.themelet;

		var type = themelet ? 'themelets' : 'themes';

		this._getNPMThemes(answers.npmSearchTerms, function(modules) {
			if (_.isEmpty(modules)) {
				gutil.log(gutil.colors.yellow('No ' + type + ' matched your search!'));

				instance._promptSearchTerms();
			}
			else {
				instance._promptModule(modules);
			}
		});
	},

	_getNPMThemes: function(npmSearchTerms, cb) {
		var instance = this;

		themeFinder.getLiferayThemeModules({
			globalModules: false,
			searchTerms: npmSearchTerms,
			themelet: this.themelet
		}, cb);
	},

	_promptModule: function(modules) {
		var instance = this;

		this._modules = modules;

		var themelet = this.themelet;

		var listType = promptUtil.getListType();

		inquirer.prompt(
			[
				{
					choices: _.bind(promptUtil.getModuleChoices, instance, modules, instance),
					filter: function(input) {
						if (themelet) {
							return _.mapValues(modules, function(theme, name) {
								return input.indexOf(name) > -1;
							});
						}
						else {
							return input;
						}
					},
					message: themelet ? 'Select a themelet' : 'Select a theme',
					name: 'module',
					type: themelet ? 'checkbox' : listType,
					when: function(answers) {
						return !_.isEmpty(modules);
					}
				}
			],
			_.bind(instance._afterPrompt, instance)
		);
	},

	_promptSearchTerms: function() {
		var instance = this;

		var themelet = this.themelet;

		inquirer.prompt(
			[
				{
					message: themelet ? 'Search npm for themelets:' : 'Search npm for themes:',
					name: 'npmSearchTerms'
				}
			],
			_.bind(this._afterPromptSearchTerms, this)
		);
	}
};

module.exports = NPMModulePrompt;
