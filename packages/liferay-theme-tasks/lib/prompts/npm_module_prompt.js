'use strict';

let _ = require('lodash');
let gutil = require('gulp-util');
let inquirer = require('inquirer');

let ModulePrompt = require('./module_prompt');
let themeFinder = require('../theme_finder');

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
		let instance = this;

		let themelet = this.themelet;

		this._getNPMModules(answers.searchTerms, function(modules) {
			if (_.isEmpty(modules)) {
				let type = themelet ? 'themelets' : 'themes';

				gutil.log(
					gutil.colors.yellow('No ' + type + ' matched your search!')
				);

				instance._promptSearchTerms();
			} else {
				instance.modules = modules;

				ModulePrompt.prompt(
					instance,
					_.bind(instance._afterPrompt, instance)
				);
			}
		});
	},

	_getNPMModules: function(searchTerms, cb) {
		themeFinder.getLiferayThemeModules(
			{
				globalModules: false,
				searchTerms: searchTerms,
				themelet: this.themelet,
			},
			cb
		);
	},

	_promptSearchTerms: function() {
		let themelet = this.themelet;

		inquirer.prompt(
			[
				{
					message: themelet
						? 'Search npm for themelets:'
						: 'Search npm for themes:',
					name: 'searchTerms',
				},
			],
			_.bind(this._afterPromptSearchTerms, this)
		);
	},
};

NPMModulePrompt.prompt = function(config, cb) {
	return new NPMModulePrompt(config, cb);
};

module.exports = NPMModulePrompt;
