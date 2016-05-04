'use strict';

var _ = require('lodash');
var gutil = require('gulp-util');
var inquirer = require('inquirer');

var promptUtil = require('./prompt_util');
var themeFinder = require('../theme_finder');

function GlobalModulePrompt(config, cb) {
	this.selectedModules = config.selectedModules;
	this.themelet = config.themelet;

	this.done = cb;

	this._prompt();
}

GlobalModulePrompt.prototype = {
	_afterPrompt: function(answers) {
		var type = this.themelet ? 'themelet' : 'theme';

		if (_.isEmpty(this._modules)) {
			gutil.log(gutil.colors.yellow('No globally installed ' + type + ' found. Install some with "npm i -g [name]"'));
		}

		if (this.themelet) {
			_.assign(answers, promptUtil.formatThemeletSelection(answers.module, this.selectedModules));
		}

		answers.modules = this._modules;

		this.done(answers);
	},

	_getGlobalThemes: function(cb) {
		var instance = this;

		themeFinder.getLiferayThemeModules({
			globalModules: true,
			themelet: this.themelet
		}, cb);
	},

	_prompt: function(options) {
		var instance = this;

		var themelet = this.themelet;

		var listType = promptUtil.getListType();

		inquirer.prompt(
			[
				{
					choices: function(answers) {
						return promptUtil.getModuleChoices(instance._modules, instance);
					},
					filter: function(input) {
						if (themelet) {
							return _.mapValues(instance._modules, function(theme, name) {
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
						var done = this.async();

						instance._getGlobalThemes(function(modules) {
							instance._modules = modules;

							done(!_.isEmpty(modules));
						});
					}
				}
			],
			_.bind(instance._afterPrompt, instance)
		);
	}
};

module.exports = GlobalModulePrompt;
