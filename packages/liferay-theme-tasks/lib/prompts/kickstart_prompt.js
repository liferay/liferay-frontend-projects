'use strict';

var _ = require('lodash');
var exec = require('child_process').exec;
var gutil = require('gulp-util');
var inquirer = require('inquirer');
var path = require('path');

var getListType = require('../get_list_type');
var GlobalThemePrompt = require('./global_theme_prompt');
var NPMThemePrompt = require('./npm_theme_prompt');
var themeFinder = require('../theme_finder');

function KiststartPrompt(cb) {
	var instance = this;

	this.done = cb;

	this._promptThemeSource();
}

KiststartPrompt.prototype = {
	_afterPromptGlobalTheme: function(answers) {
		this.done(answers);
	},

	_afterPromptNPMTheme: function(answers) {
		var done = this.done;

		if (answers.npmTheme) {
			this._installTempModule(answers.npmTheme, function() {
				done(answers);
			});
		}
		else {
			done(answers);
		}
	},

	_afterPromptThemeSource: function(answers) {
		if (answers.themeSource == 'npm') {
			new NPMThemePrompt(_.bind(this._afterPromptNPMTheme, this));
		}
		else if (answers.themeSource == 'global') {
			new GlobalThemePrompt(_.bind(this._afterPromptGlobalTheme, this));
		}
	},

	_installTempModule(moduleName, cb) {
		var tempNodeModulesPath = path.join(process.cwd(), '.temp_node_modules');

		var child = exec('npm install --prefix ' + tempNodeModulesPath + ' ' + moduleName, cb);

		child.stdout.pipe(process.stdout);
	},

	_promptThemeSource: function(options) {
		var instance = this;

		var listType = getListType();

		inquirer.prompt(
			[
				{
					choices: [
						{
							name: 'Search globally installed npm modules',
							value: 'global'
						},
						{
							name: 'Search npm registry (published modules)',
							value: 'npm'
						}
					],
					message: 'Where would you like to search?',
					name: 'themeSource',
					type: listType
				}
			],
			_.bind(instance._afterPromptThemeSource, instance)
		);
	}
};

module.exports = KiststartPrompt;
