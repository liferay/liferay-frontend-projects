'use strict';

var _ = require('lodash');
var gutil = require('gulp-util');
var inquirer = require('inquirer');

var getListType = require('../get_list_type');
var themeFinder = require('../theme_finder');

function NPMThemePrompt(cb) {
	var instance = this;

	this.done = cb;

	this._prompt();
}

NPMThemePrompt.prototype = {
	_afterPrompt: function(answers) {
		if (_.isEmpty(this._npmThemes)) {
			gutil.log(gutil.colors.yellow('No themes matched your search!'));
		}

		this.done(answers);
	},

	_getNPMThemes: function(npmSearchTerms, cb) {
		var instance = this;

		themeFinder.getLiferayThemeModules({
			globalModules: false,
			searchTerms: npmSearchTerms
		}, cb);
	},

	_prompt: function(options) {
		var instance = this;

		var listType = getListType();

		inquirer.prompt(
			[
				{
					message: 'Search npm for themes:',
					name: 'npmSearchTerms'
				},
				{
					choices: function(answers) {
						return _.keys(instance._npmThemes);
					},
					message: 'Select a theme',
					name: 'npmTheme',
					type: listType,
					when: function(answers) {
						var done = this.async();

						instance._getNPMThemes(answers.npmSearchTerms, function(themes) {
							instance._npmThemes = themes;

							done(!_.isEmpty(themes));
						});
					}
				}
			],
			_.bind(instance._afterPrompt, instance)
		);
	}
};

module.exports = NPMThemePrompt;
