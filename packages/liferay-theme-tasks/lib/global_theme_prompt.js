'use strict';

var _ = require('lodash');
var gutil = require('gulp-util');
var inquirer = require('inquirer');

var getListType = require('./get_list_type');
var themeFinder = require('./theme_finder');

function GlobalThemePrompt(cb) {
	var instance = this;

	this.done = cb;

	this._prompt();
}

GlobalThemePrompt.prototype = {
	_afterPrompt: function(answers) {
		if (_.isEmpty(answers._globalThemes)) {
			gutil.log(gutil.colors.yellow('No globally installed themes found. Install some with "npm i -g [theme-name]"'));
		}

		this.done(answers);
	},

	_getGlobalThemes: function(cb) {
		var instance = this;

		themeFinder.getLiferayThemeModules({
			globalModules: true
		}, cb);
	},

	_prompt: function(options) {
		var instance = this;

		var listType = getListType();

		inquirer.prompt(
			[
				{
					choices: function(answers) {
						return _.keys(instance._globalThemes);
					},
					message: 'Select a theme',
					name: 'globalTheme',
					type: listType,
					when: function(answers) {
						var done = this.async();

						instance._getGlobalThemes(function(themes) {
							instance._globalThemes = themes;

							done(!_.isEmpty(themes));
						});
					}
				}
			],
			_.bind(instance._afterPrompt, instance)
		);
	}
};

module.exports = GlobalThemePrompt;
