'use strict';

var _ = require('lodash');
var gutil = require('gulp-util');
var inquirer = require('inquirer');

var getListType = require('../get_list_type');
var themeFinder = require('../theme_finder');

function GlobalThemePrompt(config, cb) {
	this.themelet = config.themelet;

	this.done = cb;

	this._prompt();
}

GlobalThemePrompt.prototype = {
	_afterPrompt: function(answers) {
		var type = this.themelet ? 'themelet' : 'theme';

		if (_.isEmpty(this._globalThemes)) {
			gutil.log(gutil.colors.yellow('No globally installed ' + type + ' found. Install some with "npm i -g [name]"'));
		}

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

		var listType = getListType();

		inquirer.prompt(
			[
				{
					choices: function(answers) {
						return _.map(instance._globalThemes, function(theme, name) {
							return {
								name: name,
								value: theme.realPath
							}
						});
					},
					message: instance.themelet ? 'Select a themelet' : 'Select a theme',
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
