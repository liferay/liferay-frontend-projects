'use strict';

var _ = require('lodash');
var gutil = require('gulp-util');
var inquirer = require('inquirer');

var promptUtil = require('./prompt_util');
var themeFinder = require('../theme_finder');

function GlobalModulePrompt() {
	this.init.apply(this, arguments);
}

GlobalModulePrompt.prototype = {
	init: function(config, cb) {
		var instance = this;

		this.done = cb;
		this.selectedModules = config.selectedModules;
		this.themelet = config.themelet;

		this._getGlobalModules(function(modules) {
			instance._modules = modules;

			instance._prompt();
		});
	},

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

	_filterModule: function(input) {
		if (this.themelet) {
			return _.mapValues(this._modules, function(theme, name) {
				return input.indexOf(name) > -1;
			});
		}
		else {
			return input;
		}
	},

	_getGlobalModules: function(cb) {
		themeFinder.getLiferayThemeModules({
			globalModules: true,
			themelet: this.themelet
		}, cb);
	},

	_getModuleWhen: function() {
		return !_.isEmpty(this._modules);
	},

	_getModuleChoices: function() {
		return promptUtil.getModuleChoices(this._modules, this);
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

module.exports = GlobalModulePrompt;
