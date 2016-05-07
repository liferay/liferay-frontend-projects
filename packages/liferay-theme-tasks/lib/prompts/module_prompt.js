'use strict';

var _ = require('lodash');
var inquirer = require('inquirer');

var promptUtil = require('./prompt_util');

function ModulePrompt() {
	this.init.apply(this, arguments);
}

ModulePrompt.prototype = {
	init: function(config, cb) {
		var instance = this;

		this.done = cb;
		this.modules = config.modules;
		this.selectedModules = config.selectedModules;
		this.themelet = config.themelet;

		instance._prompt();
	},

	_afterPrompt: function(answers) {
		if (this.themelet) {
			_.assign(answers, promptUtil.formatThemeletSelection(answers.module, this.selectedModules));
		}

		answers.modules = this.modules;

		this.done(answers);
	},

	_filterModule: function(input) {
		if (this.themelet) {
			return _.mapValues(this.modules, function(theme, name) {
				return input.indexOf(name) > -1;
			});
		}
		else {
			return input;
		}
	},

	_getModuleWhen: function() {
		return !_.isEmpty(this.modules);
	},

	_getModuleChoices: function() {
		return promptUtil.getModuleChoices(this.modules, this);
	},

	_prompt: function() {
		var instance = this;

		var themelet = this.themelet;

		var listType = promptUtil.getListType();

		inquirer.prompt(
			[
				{
					choices: _.bind(instance._getModuleChoices, instance),
					filter: _.bind(instance._filterModule, instance),
					message: themelet ? 'Select a themelet' : 'Select a theme',
					name: 'module',
					type: themelet ? 'checkbox' : listType,
					when: _.bind(instance._getModuleWhen, instance)
				}
			],
			_.bind(instance._afterPrompt, instance)
		);
	}
};

module.exports = ModulePrompt;
