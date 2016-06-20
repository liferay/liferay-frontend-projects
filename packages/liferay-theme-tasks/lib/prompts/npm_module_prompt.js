'use strict';

var _ = require('lodash');
var gutil = require('gulp-util');
var inquirer = require('inquirer');

var ModulePrompt = require('./module_prompt');
var themeFinder = require('../theme_finder');

function NPMModulePrompt() {
	this.init.apply(this, arguments);
}

NPMModulePrompt.prototype = {
	init: function(config, cb) {
		this.done = cb;
		this.selectedModules = config.selectedModules;
		this.themelet = config.themelet;

		this._promptSearchTerms();
	},

	_afterPrompt: function(answers) {
		this.done(answers);
	},

	_afterPromptSearchTerms: function(answers) {
		var instance = this;

		var themelet = this.themelet;

		this._getNPMModules(answers.searchTerms, function(modules) {
			if (_.isEmpty(modules)) {
				var type = themelet ? 'themelets' : 'themes';

				gutil.log(gutil.colors.yellow('No ' + type + ' matched your search!'));

				instance._promptSearchTerms();
			}
			else {
				instance.modules = modules;

				new ModulePrompt(instance, _.bind(instance._afterPrompt, instance));
			}
		});
	},

	_getNPMModules: function(searchTerms, cb) {
		themeFinder.getLiferayThemeModules({
			globalModules: false,
			searchTerms: searchTerms,
			themelet: this.themelet
		}, cb);
	},

	_promptSearchTerms: function() {
		var themelet = this.themelet;

		inquirer.prompt(
			[
				{
					message: themelet ? 'Search npm for themelets:' : 'Search npm for themes:',
					name: 'searchTerms'
				}
			],
			_.bind(this._afterPromptSearchTerms, this)
		);
	}
};

module.exports = NPMModulePrompt;
